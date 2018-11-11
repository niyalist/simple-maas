var express = require('express');
var db = require('../db');
var router = express.Router();

/* GET home page. */
router.get('/:shape_id', function(req, res, next) {

    const query = `
    select
    	'Feature' as type,
	    row_to_json(
    		(
		    select p from (
    			select
				    shape_id as shape_id,
    				pattern_dist as dist
			    ) as p
    		)
    	)as properties,
	    st_asGeoJson(geom)::json as geometry
    from
        patterns
	where
		shape_id = $1
    `

    db.task(async t => {
        const rtn = await t.any(query, req.params.shape_id);
        console.log(rtn)
        res.json(rtn)
    })
});

module.exports = router;
