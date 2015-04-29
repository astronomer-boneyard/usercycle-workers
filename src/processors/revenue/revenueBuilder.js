import _ from 'lodash';
import stampit from 'stampit';
import util from '../../lib/util';
import funnelBuilder from '../lib/funnelBuilder';
import Revenue from '../../models/retention';

let revenueBuilder = stampit().enclose(function() {
  this.onBefore(function*() {
    yield Revenue.remove({ viewId: this.job.data.viewId }).exec();
  });

  this.pushQuery = function(view, cohortInterval, cohortStart, cohortEnd, queryStart, queryEnd) {
    let steps = [];

    steps.push({
      event_collection: view.start.event,
      actor_property: view.start.actor,
      timeframe: { start: cohortStart, end: cohortEnd },
      filters: util.processFilters(view.start.filters),
      with_actors: true
    });

    _.each(view.end.events, (ev) => {
      steps.push({
        event_collection: ev.event,
        actor_property: ev.actor,
        timeframe: { start: queryStart, end: queryEnd },
        inverted: true,
        filters: util.processFilters(view.end.filters),
        with_actors: true
      });
    });

    this.createDelayableJob('revenueRunner', view.project.organizationId, {
      title: `Revenue query - ${view.project.name}: ${view.name}`,
      viewId: view._id,
      refresh: !!this.job.data.refresh,
      cohortInterval,
      steps
    });

  }
});

export default stampit.compose(funnelBuilder, revenueBuilder);
