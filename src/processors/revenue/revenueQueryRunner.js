import _ from 'lodash';
import stampit from 'stampit';
import Revenue from '../../models/revenue';
import funnelQueryRunner from '../lib/funnelQueryRunner';
import progressJobCreator from '../lib/progressJobCreator';
import progressJob from '../lib/progressJob';


let revenueQueryRunner = stampit().enclose(function() {
  this.handleResponse = function* (view, response) {
    let {steps, result, actors} = response;

    let viewId = this.job.data.viewId,
        cohortInterval = this.job.data.cohortInterval,
        cohortDate = new Date(steps[0].timeframe.start),
        cohortSize = result[0],
        measurementDate = new Date(steps[1].timeframe.start),
        measurementValue = 0;

    let selector = { viewId, cohortInterval, cohortDate, measurementDate };
    let modifier = { $set: {cohortSize, measurementValue} };

    yield Revenue.update(selector, modifier, {upsert: true});

    _.each(view.end.events, (ev, i) => {
      let revActors = _.compact(_.difference(actors[0], actors[actors.length-1]));
      while (revActors.length > 0) {
        let query = {
          event_collection: ev.event,
          target_property: ev.amount,
          timeframe: {
            start: steps[i + 1].timeframe.start,
            end: steps[i + 1].timeframe.end
          },
          filters: [{
            property_name: ev.actor,
            operator: 'in',
            property_value: revActors.splice(0, 50)
          }]
        };

        this.createJob('revenueSum', {
          title: `Revenue query - ${view.project.name}: ${view.name}`,
          viewId: view._id,
          cohortInterval,
          cohortDate,
          measurementDate,
          query
        });
      }
    });
  };
});

export default stampit.compose(progressJobCreator, progressJob, funnelQueryRunner, revenueQueryRunner);