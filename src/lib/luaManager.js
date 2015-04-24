import Scripto from 'redis-scripto';
import thenifyAll from 'thenify-all';
import redis from './redis';

let scriptManager = new Scripto(redis);
scriptManager = thenifyAll(scriptManager);
scriptManager.loadFromDir('lua');

export default scriptManager;
