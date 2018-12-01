var express = require('express');
var db = require('../db');
var router = express.Router();

/* GET home page. */
/* 2バス停間の時刻を取り出すAPI
  クエリーの例
  　http://localhost:3000/times?src=92_05&dest=96_05
　　まだ改善が必要
　　- service_idの日付が考慮されていない
　　- 2区間を通る路線であるが、上り下りを考慮していない
*/
router.get('/', function(req, res, next) {

    const query = `
    select
    stops.stop_id,
    stops.stop_name,
    st_asGeoJson(stops.geom)::json as geometry,
    trips.trip_id,
    stop_times.arrival_time,
    stop_times.departure_time,
    stop_times.stop_sequence,
    stop_times.stop_headsign,
    trips.service_id,
    trips.trip_headsign,
    routes.route_id,
    routes.route_long_name,
    routes.route_desc
from
    stops
    inner join stop_times on stops.stop_id = stop_times.stop_id
    inner join trips on stop_times.trip_id = trips.trip_id
    inner join routes on trips.route_id = routes.route_id

where
    trips.trip_id in (
        select
            trips.trip_id
        from
            trips
            inner join routes on trips.route_id = routes.route_id
            inner join stop_times on trips.trip_id = stop_times.trip_id
            inner join stops on stop_times.stop_id = stops.stop_id
        where
            stops.stop_id = $1

        intersect

        select
            trips.trip_id
        from
            trips
            inner join routes on trips.route_id = routes.route_id
            inner join stop_times on trips.trip_id = stop_times.trip_id
            inner join stops on stop_times.stop_id = stops.stop_id
        where
            stops.stop_id = $2        
    
    ) and
    stops.stop_id in ($1, $2)
order by
    trips.trip_id,
    stop_times.stop_sequence    `

    db.task(async t => {
        const list = await t.any(query, [req.query.src,req.query.dest]);
        
        var result = [];

        for (var i = 0; i < list.length; i+=2){
            var src = list[i];
            var dest = list[i+1];

            var time_obj = {
                src_stop_id: src.stop_id,
                src_stop_name: src.stop_name,
                src_geom: src.geometry,
                src_departure_time: src.departure_time,                
                dest_stop_id: dest.stop_id,
                dest_stop_name: dest.stop_name,
                dest_geom: dest.geometry,
                dest_arrival_time: dest.arrival_time,

                route_id: src.route_id,
                route_long_name: src.route_long_name,
                route_desc: src.route_desc,
                trips_id: src.trip_id,
                trip_headsign: src.trip_headsign,
                service_id: src.service_id,
                stop_headsign: src.stop_headsign

            }


            result.unshift(time_obj);
        }

        res.json(result)
    })
});

module.exports = router;
