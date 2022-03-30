const mongoose = require('mongoose');

const outXMLSchema = mongoose.Schema({
    data: mongoose.Schema.Types.Mixed,
    date: String,
    guidRegion: String,
    guidOrganizator: String,
}, {
    timestamps: true
});

outXMLSchema.index({date: 1})
outXMLSchema.index({guidOrganizator: 1})
outXMLSchema.index({guidRegion: 1})

const outXML = mongoose.model('outXMLShoro', outXMLSchema);

/*outXML.collection.dropIndex('data_1', function(err, result) {
    if (err) {
        console.log('Error in dropping index!', err);
    }
});*/

module.exports = outXML;