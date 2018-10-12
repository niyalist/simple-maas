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
        stop_id = $1
    order by
    	service_id,
	    route_long_name,
        departure_time
    `

    db.task(async t => {
        const rtn = await t.any(query, req.params.stop_id);
//        console.log(rtn)
        res.json(rtn)
    })
});

module.exports = router;
