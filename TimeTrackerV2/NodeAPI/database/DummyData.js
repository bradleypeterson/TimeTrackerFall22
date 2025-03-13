const crypto = require('crypto');
/*
    INSERT ORDER: 
    data[0] = username;
        data[1] = password;
        data[2] = firstName;
        data[3] = lastName;
        data[4] = type;
        data[5] = isApproved;
        data[6] = true; //isActive
        data[7] = salt;

    Template:
    ,
    [
        'USERNAME',
        'FIRST',
        'LAST',
        'TYPE',
        'true'
    ]
*/

var DData = [
    [
        'MrFeeny', 
        'George', 
        'Feeny',
        'instructor',
        'true',
        'true'
    ],
    [
        'MsFrizzle',
        'Valerie',
        'Frizzle',
        'instructor',
        'true',
        'true'
    ],
    [
        'MsHoney',
        'Jennifer',
        'Honey',
        'instructor',
        'true',
        'true'
    ],
    [
        'MrKeating',
        'John',
        'Keating',
        'instructor',
        'true',
        'true'
    ],
    [
        'MrSchneebly',
        'Dewey',
        'Finn',
        'instructor',
        'true',
        'true'
    ],
    [
        'MrsMcgonagall',
        'Minerva',
        'Mcgonagall',
        'instructor',
        'true',
        'true'
    ],
    [
        'MrNye',
        'Bill',
        'Nye',
        'instructor',
        'true',
        'true'
    ],
    [
        'RGilmore',
        'Lorelai',
        'Gilmore',
        'student',
        'true',
        'true'
    ],
    [
        'JMariano',
        'Jess',
        'Mariano',
        'student',
        'true',
        'true'
    ],
    [
        'DForester',
        'Dean',
        'Forester',
        'student',
        'true',
        'true'
    ],
    [
        'LKim',
        'Lane',
        'Kim',
        'student',
        'true',
        'true'
    ],
    [
        'PGeller',
        'Paris',
        'Geller',
        'student',
        'true',
        'true'
    ],
    [
        'LHuntzberger',
        'Logan',
        'Huntzberger',
        'student',
        'true',
        'true'
    ],
    [
        'LScott',
        'Lucas',
        'Scott',
        'student',
        'true',
        'true'
    ],
    [
        'NScott',
        'Nathan',
        'Scott',
        'student',
        'true',
        'true'
    ],
    [
        'PSawyer',
        'Peyton',
        'Sawyer',
        'student',
        'true',
        'true'
    ],
    [
        'BDavis',
        'Brooke',
        'Davis',
        'student',
        'true',
        'true'
    ],
    [
        'HJames',
        'Haley',
        'James',
        'student',
        'true',
        'true'
    ],
    [
        'Mouth',
        'Marvin',
        'McFadden',
        'student',
        'true',
        'true'
    ],
    [
        'RGatina',
        'Rachel',
        'Gatina',
        'student',
        'true',
        'true'
    ],
    [
        'JJagielski',
        'Jake',
        'Jagielski',
        'student',
        'true',
        'true'
    ],
    [
        'TSmith',
        'Tim',
        'Smith',
        'student',
        'true',
        'true'
    ],
    [
        'CMatthews',
        'Cory',
        'Matthews',
        'student',
        'true',
        'true'
    ],
    [
        'TLawrence',
        'Topenga',
        'Lawrence',
        'student',
        'true',
        'true'
    ],
    [
        'SHunter',
        'Shawn',
        'Hunter',
        'student',
        'true',
        'true'
    ],
    [
        'EForeman',
        'Eric',
        'Foreman',
        'student',
        'true',
        'true'
    ],
    [
        'DPinciotti',
        'Donna',
        'Pinciotti',
        'student',
        'true',
        'true'
    ],
    [
        'SHyde',
        'Steven',
        'Hyde',
        'student',
        'true',
        'true'
    ],
    [
        'MKelso',
        'Michael',
        'Kelso',
        'student',
        'true',
        'true'
    ],
    [
        'JBurkhart',
        'Jackie',
        'Burkhart',
        'student',
        'true',
        'true'
    ],
    [
        'Fez',
        'Wilmer',
        'Valderrama',
        'student',
        'true',
        'true'
    ]
];

var DummyData= new Array(32);
for (let i = 0; i < DummyData.length; i++) {
    DummyData[i]= new Array(6);
}

for(let i = 1; i< DummyData.length-1; i++){
     //Fill username
     DummyData[i][0]= DData[i][0];
    
     //Fill Password at position 1
     var salt = crypto.randomBytes(16).toString('hex');
     var hashPass = crypto.pbkdf2Sync('admin2', salt, 1000, 64, 'sha512');
     DummyData[i][1]=hashPass.toString('hex');

     //Fill firstname
     DummyData[i][2]= DData[i][1];
     //Fill Last name
     DummyData[i][3]= DData[i][2];
     //Fill Type
     DummyData[i][4]= DData[i][3];
     //Fill salt
     DummyData[i][5]= salt;
}

var adminsalt = crypto.randomBytes(16).toString('hex');
var adminhashPass = crypto.pbkdf2Sync('admin2', adminsalt, 1000, 64, 'sha512');
DummyData[0] = [   "admin2",
            adminhashPass.toString('hex'),
            "Secondary", 
            'Admin',
            'admin', 
            adminsalt]

module.exports = { DummyData };


