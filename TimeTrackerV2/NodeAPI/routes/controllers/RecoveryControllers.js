const crypto = require('crypto');
const ConnectToDB = require('../../database/DBConnection');
const { sendEmail } = require('../../services/mailer');

const db = ConnectToDB();

exports.GetRecoveryEmailStatus = (req, res) => {
    const userID = Number(req.body.userID);
    const sessionUserID = req.session?.userID;

    if (!Number.isSafeInteger(userID) || userID <= 0) {
        return res.status(400).json({
            message: 'A valid user ID is required.'
        });
    }

    if (!sessionUserID) {
        return res.status(401).json({
            message: 'Please log in again.'
        });
    }

    // Check the logged-in user's current role in the database.
    db.get(
        `SELECT userID, type, password
         FROM Users
         WHERE userID = ? AND isActive = 1 AND isApproved = 1`,
        [sessionUserID],
        (err, requester) => {
            if (err) {
                return res.status(500).json({
                    message: 'Unable to check recovery details.'
                });
            }

            if (!requester) {
                return res.status(401).json({
                    message: 'Please log in again.'
                });
            }

            // Admins do not need another password confirmation.
            if (requester.type !== 'admin') {
                if (requester.userID !== userID) {
                    return res.status(403).json({
                        message: 'You cannot view this account’s recovery email.'
                    });
                }

                const password = req.body.password;

                if (
                    typeof password !== 'string' ||
                    !/^[a-f0-9]{128}$/i.test(password)
                ) {
                    return res.status(400).json({
                        message: 'Confirm your current password.'
                    });
                }

                const supplied = Buffer.from(password, 'hex');
                const stored = Buffer.from(requester.password, 'hex');

                if (
                    supplied.length !== stored.length ||
                    !crypto.timingSafeEqual(supplied, stored)
                ) {
                    return res.status(401).json({
                        message: 'Your current password is incorrect.'
                    });
                }
            }

            db.get(
                `SELECT email, verifiedAt
                 FROM RecoveryEmails
                 WHERE userID = ?`,
                [userID],
                (lookupError, recovery) => {
                    if (lookupError) {
                        return res.status(500).json({
                            message: 'Unable to load recovery details.'
                        });
                    }

                    return res.status(200).json({
                        email: recovery?.email || null,
                        verified: recovery?.verifiedAt != null
                    });
                }
            );
        }
    );
};


exports.VerifyRecoveryEmail = async (req, res) => {
        const { token } = req.body;

        if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
            return res.status(400).json({
                message: 'This verification link is invalid or expired.'
            });
        }

        const tokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // A separate connection keeps this transaction isolated.
        const connection = ConnectToDB();

        const run = (sql, params = []) =>
            new Promise((resolve, reject) => {
                connection.run(sql, params, function (err) {
                    if (err) reject(err);
                    else resolve(this);
                });
            });

        const get = (sql, params = []) =>
            new Promise((resolve, reject) => {
                connection.get(sql, params, (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

        let transactionStarted = false;

        try {
            await run('BEGIN IMMEDIATE');
            transactionStarted = true;

            const now = Date.now();

            const record = await get(
                `SELECT t.userID, t.email
                 FROM AccountRecoveryTokens t
                 JOIN Users u ON u.userID = t.userID
                 WHERE t.tokenHash = ?
                   AND t.purpose = 'verify-email'
                   AND t.usedAt IS NULL
                   AND t.expiresAt > ?
                   AND u.isActive = 1
                   AND u.isApproved = 1`,
                [tokenHash, now]
            );

            if (!record) {
                await run('ROLLBACK');
                transactionStarted = false;

                return res.status(400).json({
                    message: 'This verification link is invalid or expired.'
                });
            }

            await run(
                `INSERT INTO RecoveryEmails (userID, email, verifiedAt)
                 VALUES (?, ?, ?)
                 ON CONFLICT(userID) DO UPDATE SET
                   email = excluded.email,
                   verifiedAt = excluded.verifiedAt`,
                [record.userID, record.email, now]
            );

            // Invalidate outstanding verification and reset links for this account.
            await run(
                `UPDATE AccountRecoveryTokens
                 SET usedAt = ?
                 WHERE userID = ? AND usedAt IS NULL`,
                [now, record.userID]
            );

            await run('COMMIT');
            transactionStarted = false;

            return res.status(200).json({
                message: 'Your recovery email has been verified.'
            });
        } catch (error) {
            if (transactionStarted) {
                try {
                    await run('ROLLBACK');
                } catch (rollbackError) {
                    console.error('Recovery verification rollback failed.');
                }
            }

            return res.status(500).json({
                message: 'Unable to verify the email. Please try again later.'
            });
        } finally {
            connection.close();
        }
};

// Send a reset link only to the account's previously verified email.
exports.RequestPasswordReset = (req, res) => {
    const { username } = req.body;

    if (
        typeof username !== 'string' ||
        username.trim().length === 0 ||
        username.length > 200
    ) {
        return res.status(400).json({
            message: 'Enter your username.'
        });
    }

    // Use the same response for unknown accounts and accounts without recovery.
    const response = {
        message:
            'If this account has a verified recovery email, a reset link ' +
            'will be sent. Otherwise, contact your administrator.'
    };

    db.get(
        `SELECT u.userID, r.email
         FROM Users u
         JOIN RecoveryEmails r ON r.userID = u.userID
         WHERE u.username = ?
           AND u.isActive = 1
           AND u.isApproved = 1
           AND r.verifiedAt IS NOT NULL`,
        [username],
        (err, account) => {
            if (err) {
                return res.status(500).json({
                    message: 'Unable to process the request. Try again later.'
                });
            }

            if (!account) {
                return res.status(200).json(response);
            }

            const token = crypto.randomBytes(32).toString('hex');
            const tokenHash = crypto
                .createHash('sha256')
                .update(token)
                .digest('hex');

            db.run(
                `INSERT INTO AccountRecoveryTokens
                 (tokenHash, userID, purpose, email, expiresAt)
                 VALUES (?, ?, 'reset-password', ?, ?)`,
                [
                    tokenHash,
                    account.userID,
                    account.email,
                    Date.now() + 15 * 60 * 1000
                ],
                async (insertError) => {
                    if (insertError) {
                        return res.status(500).json({
                            message: 'Unable to process the request. Try again later.'
                        });
                    }

                    try {
                        const link = new URL(
                            '/recover-password',
                            process.env.APP_URL
                        );
                        link.searchParams.set('token', token);

                        await sendEmail({
                            to: account.email,
                            subject: 'Reset your TimeTracker password',
                            text:
                                'Use this link to choose a new password:\n\n' +
                                link.toString() +
                                '\n\nThis link expires in 15 minutes and ' +
                                'can only be used once. If you did not ' +
                                'request this, ignore this email.'
                        });
                    } catch (error) {
                        db.run(
                            'DELETE FROM AccountRecoveryTokens WHERE tokenHash = ?',
                            [tokenHash]
                        );
                        console.error('Password recovery email delivery failed.');
                    }

                    return res.status(200).json(response);
                }
            );
        }
    );
};

exports.RequestRecoveryEmailVerification = async (req, res) => {
    const { username, password } = req.body;
    const email = typeof req.body.email === 'string'
        ? req.body.email.trim()
        : '';

    if (
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        return res.status(400).json({
            message: 'Enter a valid recovery email address.'
        });
    }

    const get = (sql, params) => new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

    const run = (sql, params) => new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });

    let tokenHash;

    try {
        let user;

        if (req.body.userID !== undefined) {
            // Admin-assisted setup: authenticate through the login session.
            const admin = await get(
                `SELECT userID FROM Users
                 WHERE userID = ? AND type = 'admin'
                   AND isActive = 1 AND isApproved = 1`,
                [req.session?.userID ?? null]
            );

            if (!admin) {
                return res.status(403).json({
                    message: 'An active administrator login is required.'
                });
            }

            const userID = Number(req.body.userID);

            if (!Number.isSafeInteger(userID) || userID <= 0) {
                return res.status(400).json({
                    message: 'A valid user ID is required.'
                });
            }

            user = await get(
                `SELECT userID FROM Users
                 WHERE userID = ? AND isActive = 1 AND isApproved = 1`,
                [userID]
            );

            if (!user) {
                return res.status(404).json({
                    message: 'An active, approved account was not found.'
                });
            }
        } else {
            // Self-service setup: confirm the account's current password.
            if (
                typeof username !== 'string' ||
                !username.trim() ||
                typeof password !== 'string' ||
                !/^[a-f0-9]{128}$/i.test(password)
            ) {
                return res.status(400).json({
                    message: 'Enter your username and current password.'
                });
            }

            user = await get(
                `SELECT userID, password FROM Users
                 WHERE username = ? AND isActive = 1 AND isApproved = 1`,
                [username]
            );

            const supplied = Buffer.from(password, 'hex');
            const stored = Buffer.from(user?.password || '', 'hex');

            if (
                !user ||
                supplied.length !== stored.length ||
                !crypto.timingSafeEqual(supplied, stored)
            ) {
                return res.status(401).json({
                    message: 'Username or password is incorrect.'
                });
            }
        }

        const token = crypto.randomBytes(32).toString('hex');
        tokenHash = crypto.createHash('sha256')
            .update(token).digest('hex');

        await run(
            `INSERT INTO AccountRecoveryTokens
             (tokenHash, userID, purpose, email, expiresAt)
             VALUES (?, ?, 'verify-email', ?, ?)`,
            [tokenHash, user.userID, email, Date.now() + 15 * 60 * 1000]
        );

        const link = new URL('/verify-recovery-email', process.env.APP_URL);
        link.searchParams.set('token', token);

        await sendEmail({
            to: email,
            subject: 'Verify your TimeTracker recovery email',
            text:
                'A recovery email setup was requested for your account.\n\n' +
                'Confirm this email address:\n' + link.toString() +
                '\n\nThis link expires in 15 minutes. ' +
                'If you did not request this, contact your administrator.'
        });

        return res.status(200).json({
            message: 'Verification email sent. The address becomes active after verification.'
        });
    } catch (error) {
        if (tokenHash) {
            try {
                await run(
                    'DELETE FROM AccountRecoveryTokens WHERE tokenHash = ?',
                    [tokenHash]
                );
            } catch (cleanupError) {
                console.error('Recovery token cleanup failed.');
            }
        }

        return res.status(503).json({
            message: 'Unable to send the verification email. Please try again later.'
        });
    }
};


// Change a password using a valid, unused recovery token.
exports.ResetPasswordWithToken = async (req, res) => {
    const { token, password, salt } = req.body;

    if (
        typeof token !== 'string' ||
        !/^[a-f0-9]{64}$/.test(token) ||
        typeof password !== 'string' ||
        !/^[a-f0-9]{128}$/i.test(password) ||
        typeof salt !== 'string' ||
        !/^[a-f0-9]{32}$/i.test(salt)
    ) {
        return res.status(400).json({
            message: 'A valid reset link and new password are required.'
        });
    }

    const tokenHash = crypto.createHash('sha256')
        .update(token).digest('hex');
    const connection = ConnectToDB();

    const run = (sql, params = []) => new Promise((resolve, reject) => {
        connection.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });

    const get = (sql, params = []) => new Promise((resolve, reject) => {
        connection.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

    let transactionStarted = false;

    try {
        await run('BEGIN IMMEDIATE');
        transactionStarted = true;
        const now = Date.now();

        const record = await get(
            `SELECT t.userID
             FROM AccountRecoveryTokens t
             JOIN Users u ON u.userID = t.userID
             JOIN RecoveryEmails r ON r.userID = t.userID
             WHERE t.tokenHash = ?
               AND t.purpose = 'reset-password'
               AND t.usedAt IS NULL
               AND t.expiresAt > ?
               AND r.email = t.email
               AND r.verifiedAt IS NOT NULL
               AND u.isActive = 1
               AND u.isApproved = 1`,
            [tokenHash, now]
        );

        if (!record) {
            await run('ROLLBACK');
            transactionStarted = false;
            return res.status(400).json({
                message: 'This reset link is invalid, expired, or already used.'
            });
        }

        await run(
            'UPDATE Users SET password = ?, salt = ? WHERE userID = ?',
            [password, salt, record.userID]
        );

        // Consume this link and invalidate other outstanding recovery links.
        await run(
            `UPDATE AccountRecoveryTokens
             SET usedAt = ?
             WHERE userID = ? AND usedAt IS NULL`,
            [now, record.userID]
        );

        await run('COMMIT');
        transactionStarted = false;

        return res.status(200).json({
            message: 'Password changed. You can now log in with your new password.'
        });
    } catch (error) {
        if (transactionStarted) {
            try {
                await run('ROLLBACK');
            } catch (rollbackError) {
                console.error('Password reset rollback failed.');
            }
        }

        return res.status(500).json({
            message: 'Unable to reset your password. Please try again later.'
        });
    } finally {
        connection.close();
    }
};
