const dotenv = require( 'dotenv' );
dotenv.config();

const date = require( 'date-and-time' );
const axios = require('axios');

var TogglClient = require( 'toggl-api' );
var toggl = new TogglClient({ apiToken: process.env.TOGGLEAPIKEY });

var lookupPlackerCard = async ( description ) => {

  try {

    let response = await axios.get( 'https://placker.com/public/api/card?title=' + description , {
      headers: {
        'X-API-KEY': process.env.PLACKERAPIKEY
      },
    });

    if( response.data.length === 0 ) {
      return {};
    }

    return response.data[0];

  }

  catch( err ) {
    console.log( err.response.statusText );
    return {};
  }

}

var updatePlackerCardEffort = async ( id , duration , externalFields ) => {

  try {

    let response = await axios.patch( 'https://placker.com/public/api/card/' + id , {
      actualEffort: duration,
      externalFields: externalFields,
    }, {
      headers: {
        'X-API-KEY': process.env.PLACKERAPIKEY
      },
    });

    return true;

  }

  catch( err ) {
    console.log( err.response.statusText );
    return false;
  }

}

exports.run = ( event , context ) => {

  const now = new Date();
  const minus15 = date.addHours( now , -6 );

  const start = date.parse( date.format( minus15 , 'YYYY/MM/DD HH:mm:ss' ) , 'YYYY/MM/DD HH:mm:ss' );
  const end = date.parse( date.format( now , 'YYYY/MM/DD HH:mm:ss' ) , 'YYYY/MM/DD HH:mm:ss' );

  toggl.getTimeEntries( start , end , async ( err , timeEntries ) => {

    if( err ) {
      console.log( 'Error looking up time entries' );
      return;
    }

    for( let timeEntry of timeEntries ) {

      if( typeof( timeEntry.stop ) === 'undefined' ) {
        continue;
      }

      let actualEffort = 0;
      let cardTitle = timeEntry.description;
      let externalFields = {};
      let relatedCard = await lookupPlackerCard( cardTitle );

      if( typeof( relatedCard.id ) === 'undefined' ) {
        continue;
      }

      if( typeof( relatedCard.effort.actual ) !== 'undefined' ) {
        actualEffort = relatedCard.effort.actual * 60;
      }

      if( typeof( relatedCard.externalFields ) !== 'undefined' ) {
        externalFields = relatedCard.externalFields;
      }

      if( typeof( externalFields.toggleIds ) !== 'undefined' ) {
        externalFields.toggleIds.value = externalFields.toggleIds.value.split( ',' );
      } else {
        externalFields.toggleIds = {
          value: [],
        };
      }

      if( externalFields.toggleIds.value.indexOf( timeEntry.id.toString()) !== -1 ) {
        continue;
      }

      externalFields.toggleIds.value.push( timeEntry.id );
      externalFields.toggleIds.value = externalFields.toggleIds.value.join( ',' );

      sendExternalFields = [{
        name: 'toggleIds',
        value: externalFields.toggleIds.value,
      }]

      let updatedEffort = actualEffort + timeEntry.duration;
      await updatePlackerCardEffort( relatedCard.id , updatedEffort , sendExternalFields );

    }

  });

};
