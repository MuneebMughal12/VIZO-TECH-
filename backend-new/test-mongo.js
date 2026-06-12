const { MongoMemoryServer } = require('mongodb-memory-server');
async function test() {
  console.log('Starting MongoDB memory server test inside backend...');
  try {
    process.env.MONGOMS_DEBUG = '1';
    const mongo = await MongoMemoryServer.create({
      instance: {
        dbName: 'vizo_tech'
      }
    });
    console.log('MongoDB Memory Server Uri:', mongo.getUri());
    await mongo.stop();
    console.log('Stop success');
  } catch (err) {
    console.error('Detailed Error:', err);
  }
}
test();
