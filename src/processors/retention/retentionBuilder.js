import _ from 'lodash';
import stampit from 'stampit';
import util from '../../lib/util';
import progressJobCreator from '../lib/progressJobCreator';
import funnelBuilder from '../lib/funnelBuilder';
import delayableJob from '../lib/delayableJob';

let retentionBuilder = stampit().enclose(function() {
  this.pushQuery = function(view, cohortInterval, cohortStart, cohortEnd, queryStart, queryEnd) {
    let steps = [];

    steps.push({
      event_collection: view.start.event,
      actor_property: view.start.actor,
      timeframe: { start: cohortStart, end: cohortEnd },
      filters: util.processFilters(view.start.filters)
    });

    _.each(view.end.events, (ev) => {
      steps.push({
        event_collection: ev.event,
        actor_property: ev.actor,
        timeframe: { start: queryStart, end: queryEnd },
        inverted: true,
        filters: util.processFilters(view.end.filters)
      });
    });

    this.createJob('retentionQueryRunner', {
      title: `Retention query - ${view.project.name}: ${view.name}`,
      viewId: view._id,
      cohortInterval,
      steps
    });

  }
});

export default stampit.compose(delayableJob, progressJobCreator, funnelBuilder, retentionBuilder);
