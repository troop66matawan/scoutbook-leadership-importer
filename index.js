const csvToJson = require('csvtojson');
const ScoutbookLeadershipPosition = require('scoutbook-leadership/leadershipPos');
const Scout = require('scoutbook-scout');

exports.scoutbook_leadership_importer = function (scouts, importPath) {

    function stringToDate(stringDate) {
        let date;
        if (stringDate !== '') {
            const dateSegments = stringDate.split('/');
            if (dateSegments.length === 3) {
                date = new Date(dateSegments[2], dateSegments[0]-1, dateSegments[1])
            }
        }
        return date;
    }

    return csvToJson()
        .on('header', function (header) {
            console.log(header);
        })
        .fromFile(importPath)
        .then(function (importedData) {
            importedData.forEach(leadershipPosition => {
                const bsaId = leadershipPosition['BSA Member ID'];
                const firstName = leadershipPosition['First Name'].trim();
                const middleName = leadershipPosition['Middle Name'].trim();
                const lastName = leadershipPosition['Last Name'].trim();
                const positionName = leadershipPosition['Position'];
                const startDate = leadershipPosition['Start Date'];
                const endDate = leadershipPosition['End Date'];


                const scoutKey = bsaId + '_' + firstName  + '_' + lastName;
                let scout;
                if (scouts[scoutKey]) {
                    scout = scouts[scoutKey];
                } else {
                    scout = new Scout(bsaId,firstName,middleName,lastName,'');
                    scouts[scoutKey] = scout;
                }

                if (positionName && positionName.length > 0) {
                    const position = new ScoutbookLeadershipPosition(positionName,
                        stringToDate(startDate), stringToDate(endDate));
                    const leadership = scout.leadership;
                    leadership.addPosition(position);
                }
            });
            return scouts;
        });
};

if (process.argv.length !== 3) {
    console.log('Usage: ' + process.argv[1] + ' <scoutbook_leadership.csv file to import>');
} else {
    exports.scoutbook_leadership_importer({},process.argv[2])
        .then(function (scouts) {
            console.log(JSON.stringify(scouts));
        })
        .catch(function (err) {
            console.error(err.message);
        });
}

