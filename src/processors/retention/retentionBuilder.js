import _ from 'lodash';
import stampit from 'stampit';
import util from '../../lib/util';
import funnelBuilder from '../lib/funnelBuilder';
import Retention from '../../models/retention';

let retentionBuilder = stampit().enclose(function() {
  this.onBefore(function*() {
    yield Retention.remove({ viewId: this.job.data.viewId }).exec();
  });

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

    this.createDelayableJob('retentionRunner', view.project.organizationId, {
      title: `Retention query - ${view.project.name}: ${view.name}`,
      viewId: view._id,
      refresh: !!this.job.data.refresh,
      cohortInterval,
      steps
    });

  };
});

export default stampit.compose(funnelBuilder, retentionBuilder);
