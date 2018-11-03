var express = require('express');
var db = require('../db');
var router = express.Router();

/* GET timetabe json. */
router.get('/:stop_id', function(req, res, next) {
    const query = `
    select 
    	departure_time,
	    tr.trip_headsign,
    	tr.shape_id,
	    tr.service_id,
    	rt.route_long_name,
	    ag.agency_name
    from
    	stop_times as st
	    inner join trips as tr on st.trip_id = tr.trip_id
    	inner join routes as rt on tr.route_id = rt.route_id
	    inner join agency as ag on rt.agency_id = ag.agency_id
    where
        stop_id = $1 and
        service_id in (select service_id from universal_calendar where date = $2)
    order by
    	service_id,
	    route_long_name,
        departure_time
    `

    db.task(async t => {
        if (req.query.date && req.query.date.match(/^[0-9]{8}$/)){
            var date = new Date(parseInt(req.query.date.substring(0,4)),  //Year
                                 parseInt(req.query.date.substring(4,6))-1,  //Month starts from 0
                                parseInt(req.query.date.substring(6,8)));  //Date
        }else{
            var date = new Date();
        }
        console.log('DateParam: ' +  req.query.date);
        console.log('DateObj: ' +  date);
        console.log('DATE: ' +  date_to_sql(date));
        const rtn = await t.any(query, [req.params.stop_id, date_to_sql(date)]);
        res.json(rtn)
    })
});

function date_to_sql(date) {
    var y0 = ('0000' + date.getFullYear()).slice(-4);
    var m0 = ('00' + (date.getMonth()+1 )).slice(-2);   
    var d0 = ('00' + date.getDate()).slice(-2);
    return `${y0}-${m0}-${d0}`;
}

module.exports = router;
