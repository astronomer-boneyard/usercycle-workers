import Monk from 'monk';
import wrap from 'co-monk';
import random from 'meteor-random';

// XXX: Override monk's id casting function to return meteor style id's
Monk.Collection.prototype.id = (str) => { return !str ? random.id() : str; }

// Setup database and collections
const url = 'mongodb://localhost:3001/meteor'

// Connect to the database
let db = Monk(url);

// Export should be cached, so subsequent imports will not re-run
export default {
  views: wrap(db.get('views')),
  projects: wrap(db.get('projects')),
  users: wrap(db.get('users'))
}
