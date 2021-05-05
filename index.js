const cron = require('node-cron');
const moment = require('moment');
const axios = require('axios');


async function main() {
    try {
        cron.schedule("*/1 * * * *", async () => {
                    var config = {
                        method: 'get',
                        url: Token,
                        data: {
                            chat_id: chat_id,
                            text: message,
                        }
                    }
                    axios(config)
                    .then(function (response) {
                    })
                    .catch(function (error) {
                        console.log("erroring out -", error.response.data);
                    })
					districtArray = [312, 314, 337, 363, 165, 247, 188];
                    districtNameArray = ["Bhopal", "Indore", "Chhindwara", "Pune", "Surat", "East Singhbhum", "Gurgaon"]
					districtArray.forEach(async (district, i) => {
                        console.log(districtNameArray[i], "  ", district);
						await checkAvailability(district, districtNameArray[i]);
						console.log("done");
					});
				});
    } catch (e) {
        console.log('an error occured: ' + JSON.stringify(e, null, 2));
        throw e;
    }
}

main().then(()=>{
    console.log("its running");
});

async function checkAvailability(district=312, districtName) {

    let datesArray = await fetchNext10Days();
    datesArray.forEach(async date => {
        await getSlotsForDate(date, district, districtName);
    })
}
 
async function getSlotsForDate(DATE, DISTRICT, districtName) {
    let config = {
        method: 'get',
        url: 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id=' + DISTRICT + '&date=' + DATE,
        headers: {
            'accept': 'application/json',
            'Accept-Language': 'hi_IN'
        }
    };

    axios(config)
        .then(function (slots) {
            if (slots){
            let sessions = slots.data.centers.map((x) => {
							y = x.sessions.filter(
								(session) =>{
									if (session.min_age_limit < 45 && session.available_capacity > 0){
                                        return true
                                    } else return false
                                }
							);
							if (y != false) {
                                session = y.map(session => {
                                    return {
                                        date: session.date,
                                        available_capacity: session.available_capacity,
                                        vaccin: session.vaccin,
                                    }
                                })
								return {
                                    centerName: x.name,
                                    address: x.address,
                                    pincode: x.pincode,
                                    session: session,
                                };
							} else return false
						}).filter(x => x!= false);
            if(sessions.length > 0) {
                notifyMe(sessions, districtName);
            }
        }
        })
        .catch(function (error) {
            console.log(error);
        });

}


function notifyMe(slots, districtName) {
    console.log("slots length",slots.length);
    // slots.forEach((slot, i) => {
    if (slots.length>10)
        len = 10
    else 
        len = slots.len
    console.log(districtName);
    message = `----${districtName} -----\n\n\n`;
    intevalTimeCounter = 0;
    for(var i= 0; i< len ; i++){
        slot = slots[i];
        message += `Name: ${slot.centerName}`+'\n'
                + `Addr: ${slot.address}, ${slot.pincode}, ${districtName}` +'\n'
                + `slot:` +'\n';
        count = 1;
        slot.session.forEach(i => {
            message+= ` ${count++}: date:${i.date},slots:${i.available_capacity}` +'\n';
        })
        message+="\n\n"

        if(message.length >2000 || i == len - 1){
            
                console.log("message len = ", message.length);
                var config = {
                    method: 'get',
                    url: token,
                    data: {
                        chat_id: chat_id,
                        text: message,
                    }
                }
                intevalTimeCounter++
            setTimeout(() => {
                axios(config)
                .then(function (response) {
                  console.log(JSON.stringify(response.data));
                })
                .catch(function (error) {
                    console.log("erroring out -", error.response.data);
                })
                console.log(districtName,  "  counter --" ,intevalTimeCounter * 900);
            },intevalTimeCounter * 900)
            message = '';
        }
    }
    // })
}

async function fetchNext10Days(){
    let dates = [];
    let today = moment();
    let dateString = today.format('DD-MM-YYYY')
    dates.push(dateString);
    today.add(1, 'day');
    return dates;
}   