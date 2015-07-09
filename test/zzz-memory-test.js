/*eslint-env mocha */

if(typeof gc === 'undefined'){
  throw new Error("Destroy test should be run with --expose-gc");
}

console.log('Running memory test...');

var assert = require('assert');

var Reader = require('../');

var fs = require('fs');
var file = 'test/data/GeoIP2-Precision-ISP-Test.mmdb';
var fileSize = fs.statSync(file).size;

var readers = [];

var start = process.memoryUsage();

console.log('Initial RSS: %s', start.rss);

var num = 5000;

// Do a few loops of loading lots of stuff into mem and getting rid of it

for(var j = 0; j < 10; j += 1){

  readers.forEach(function(r){
    r.destroy();
  });

  gc();

  for(var i = 0; i < num; i++){
    readers.push(new Reader(file));
  }

  gc();

  var mem = process.memoryUsage();

  console.log('Pass %s RSS: %s', j, mem.rss);

  // We've loaded ${num} copies of the file into mem, they should be there
  assert(mem.rss - start.rss > num * fileSize);

  // Dispose + gc + reload shouldn't increase the mem too much
  assert(mem.rss - start.rss < num * fileSize * 1.5);
}

// If we actually get to this point without crashing, it must have worked
