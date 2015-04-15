import _ from 'lodash';
import stampit from 'stampit';
import util from '../../lib/util';
import queue from '../../lib/queue';
import funnelQueryBuilder from '../lib/funnelQueryBuilder';

let retentionQueryBuilder = stampit().enclose(function() {

  this.pushQuery = function(view, cohortStart, cohortEnd, queryStart, queryEnd) {
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

    queue.create('retentionQueryRunner', {
      viewId: 'j74dvzrWjf5qm3tSH',
      cohortInterval: 'day',
      steps
    }).removeOnComplete(true).save();

  }
});

export default stampit.compose(funnelQueryBuilder, retentionQueryBuilder);
