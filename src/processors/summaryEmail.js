import db from '../db'
import util from '../util';
import stampit from 'stampit';

let factory = stampit().enclose(function(){

  this.process = function* (job, done){

    let view = yield db.views.findOne({_id: 'S2GKhPr6g2muCatGw'});
    let project = yield db.projects.findOne({_id: view.projectId});
    console.log({ view, project });

  }



  // this.generateData = () => {
  //   let pack = projectName:
  //   return util.INTERVALS.forEach((i) => {
  //
  //   });
  // }


});

export default factory;
