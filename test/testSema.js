'use strict';
let assert = require('assert');
const supertest = require('supertest');
const api = supertest('http://localhost:8080/v1');
let checkHandle = 'default';
let EXP = 0;

// search => CREATE / DELETE / LOCK / RELEASE / UPDATE


// = = = = = CREATE = = = = =

describe('Semaphore CREATE (basic)',()=>{

	it('semaKeyC0 / create',(done)=>{
		api.post('/semaphore/semaKeyC0')
	    .set('Content-Type', 'application/json')
	    .send('{"ttl":2,"maxCapacity":2}')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
    		checkHandle=res['body']['message']['handle'];
    		EXP = res['body']['message']['expiry'];
			assert.equal(res['body']['message']['id'],'semaKeyC0');
			assert.equal(res['body']['message']['maxCapacity'],2);
			done();
	    })	
	});

	it('semaKeyC0 / create same key BEFORE expiry',(done)=>{
		api.post('/semaphore/semaKeyC0')
	    .set('Content-Type', 'application/json')
	    .send('{"ttl":2,"maxCapacity":2}')
	    .expect(409)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['statusCode'],409);
	    	done();
	    })	
	});

	//wait 1 sec
	it('semaKeyC0 / create same key AFTER expiry',(done)=>{
		setTimeout(()=>{
			api.post('/semaphore/semaKeyC0')
		    .set('Content-Type', 'application/json')
		    .send('{"ttl":10,"maxCapacity":10}')
		    .expect(200)
		    .end((err,res)=>{
		    	if(err) return done(err);
	    		assert.notEqual(res['body']['message']['handle'],checkHandle);
	    		assert.equal(res['body']['message']['id'],'semaKeyC0');
				assert.equal(res['body']['message']['maxCapacity'],10);
				done();
		    })
	    },1800);
	}).timeout(5000);

});

describe('Semaphore CREATE (ttl forbidden)',()=>{

	it('semaKeyC1 / create no body / 200',(done)=>{
		api.post('/semaphore/semaKeyC1')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
    		checkHandle=res['body']['message']['handle'];
			assert.equal(res['body']['message']['id'],'semaKeyC1');
			assert.equal(res['body']['message']['maxCapacity'],15);
			done();
	    })	
	});

	it('delete',(done)=>{
		api.delete('/semaphore/semaKeyC1/'+checkHandle)
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })
	});

	it('query not exist',(done)=>{
		api.get('/semaphore/semaKeyC1')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

	it('semaKeyC1 / create no ttl max 50',(done)=>{
		api.post('/semaphore/semaKeyC1')
	    .set('Content-Type', 'application/json')
	    .send('{"maxCapacity":50}')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
    		checkHandle=res['body']['message']['handle'];
			assert.equal(res['body']['message']['id'],'semaKeyC1');
			assert.equal(res['body']['message']['maxCapacity'],50);
			done();
	    })	
	});

	it('delete',(done)=>{
		api.delete('/semaphore/semaKeyC1/'+checkHandle)
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })
	});

	it('query not exist',(done)=>{
		api.get('/semaphore/semaKeyC1')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

	it('semaKeyC1 / create ttl 10 no maxCapacity',(done)=>{
		api.post('/semaphore/semaKeyC1')
	    .set('Content-Type', 'application/json')
	    .send('{"ttl":10}')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
    		checkHandle=res['body']['message']['handle'];
			assert.equal(res['body']['message']['id'],'semaKeyC1');
			assert.equal(res['body']['message']['maxCapacity'],15);
			done();
	    })	
	});

	it('delete',(done)=>{
		api.delete('/semaphore/semaKeyC1/'+checkHandle)
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })
	});

	it('query not exist',(done)=>{
		api.get('/semaphore/semaKeyC1')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

	it('semaKeyC1 / create ttl maxCapacity > 3600',(done)=>{
		api.post('/semaphore/semaKeyC1')
	    .set('Content-Type', 'application/json')
	    .send('{"ttl":3601,"maxCapacity":3601}')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })	
	});

	it('semaKeyC1 / create ttl maxCapacity = 0',(done)=>{
		api.post('/semaphore/semaKeyC1')
	    .set('Content-Type', 'application/json')
	    .send('{"ttl":0,"maxCapacity":0}')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })	
	});

	it('semaKeyC1 / create ttl 10 max = 0',(done)=>{
		api.post('/semaphore/semaKeyC1')
	    .set('Content-Type', 'application/json')
	    .send('{"ttl":10,"maxCapacity":0}')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })	
	});

	it('semaKeyC1 / create ttl 10 max = 9999',(done)=>{
		api.post('/semaphore/semaKeyC1')
	    .set('Content-Type', 'application/json')
	    .send('{"ttl":10,"maxCapacity":9999}')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	checkHandle=res['body']['message']['handle'];
			assert.equal(res['body']['message']['id'],'semaKeyC1');
			assert.equal(res['body']['message']['maxCapacity'],9999);
			done();
	    })	
	});

	it('delete',(done)=>{
		api.delete('/semaphore/semaKeyC1/'+checkHandle)
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })
	});

	it('query not exist',(done)=>{
		api.get('/semaphore/semaKeyC1')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

	it('semaKeyC1 / create no ttl maxCapacity = 0',(done)=>{
		api.post('/semaphore/semaKeyC1')
	    .set('Content-Type', 'application/json')
	    .send('{"maxCapacity":0}')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })	
	});

	it('semaKeyC1 / create no ttl max = 9999',(done)=>{
		api.post('/semaphore/semaKeyC1')
	    .set('Content-Type', 'application/json')
	    .send('{"ttl":10,"maxCapacity":9999}')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	checkHandle=res['body']['message']['handle'];
			assert.equal(res['body']['message']['id'],'semaKeyC1');
			assert.equal(res['body']['message']['maxCapacity'],9999);
			done();
	    })	
	});

	it('delete',(done)=>{
		api.delete('/semaphore/semaKeyC1/'+checkHandle)
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })
	});

	it('query not exist',(done)=>{
		api.get('/semaphore/semaKeyC1')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

	it('semaKeyC1 / create ttl > 3600 maxCapacity 10',(done)=>{
		api.post('/semaphore/semaKeyC1')
	    .set('Content-Type', 'application/json')
	    .send('{"ttl":3601,"maxCapacity":10}')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })	
	});

	it('semaKeyC1 / create ttl = 0 maxCapacity 10',(done)=>{
		api.post('/semaphore/semaKeyC1')
	    .set('Content-Type', 'application/json')
	    .send('{"ttl":0,"maxCapacity":10}')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })	
	});

	it('semaKeyC1 / create ttl > 3600 no maxCapacity',(done)=>{
		api.post('/semaphore/semaKeyC1')
	    .set('Content-Type', 'application/json')
	    .send('{"ttl":3601}')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })	
	});

	it('semaKeyC1 / create ttl = 0 no maxCapacity',(done)=>{
		api.post('/semaphore/semaKeyC1')
	    .set('Content-Type', 'application/json')
	    .send('{"ttl":0}')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })	
	});

	it('query not exist',(done)=>{
		api.get('/semaphore/semaKeyC1')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});


});


// = = = = = DELETE = = = = =

describe('Semaphore DELETE',()=>{

	it('semaKeyD0 / create',(done)=>{
		api.post('/semaphore/semaKeyD0')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);	    	
    		checkHandle=res['body']['message']['handle'];
    		EXP = res['body']['message']['expiry'];
			assert.equal(res['body']['message']['id'],'semaKeyD0');
			assert.equal(res['body']['message']['maxCapacity'],15);
			done();
	    })	
	});

	it('query if exist',(done)=>{
		api.get('/semaphore/semaKeyD0')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['body']['message']['id'],'semaKeyD0');
	    	done();	
	    })
	});

	it('semaKeyD0 delete with WRONG handle',(done)=>{
		api.delete('/semaphore/semaKeyD0/abcdefg098765xyz')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })
	});

	it('query again,should still exist',(done)=>{
		api.get('/semaphore/semaKeyD0')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['body']['message']['id'],'semaKeyD0');
	    	done();	
	    })
	});

	it('semaKeyD0 delete with CORRECT handle',(done)=>{
		api.delete('/semaphore/semaKeyD0/'+checkHandle)
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })
	});

	it('query again, not exist',(done)=>{
		api.get('/semaphore/semaKeyD0')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

	it('semaKeyD0 not exist when delete',(done)=>{
		api.delete('/semaphore/semaKeyD0/'+checkHandle)
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })
	});


});


// = = = = = UPDATE = = = = =

describe('Semaphore UPDATE',()=>{

	it('semaKeyU0 / create',(done)=>{
		api.post('/semaphore/semaKeyU0')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);	    	
    		checkHandle = res['body']['message']['handle'];
    		EXP = res['body']['message']['expiry'];
			assert.equal(res['body']['message']['id'],'semaKeyU0');
			done();
	    })	
	});

	it('query ,should exist',(done)=>{
		api.get('/semaphore/semaKeyU0')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['body']['message']['id'],'semaKeyU0');
	    	done();	
	    })
	});

	it('Update with WRONG handle',(done)=>{
		api.patch('/semaphore/semaKeyU0/abcdefg0987xye34zz')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

	it('query ,should not change anything',(done)=>{
		api.get('/semaphore/semaKeyU0')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['body']['message']['id'],'semaKeyU0');
	    	assert.equal(res['body']['message']['expiry'],EXP);
	    	done();	
	    })
	});

	it('Update with empty body / delay 60sec',(done)=>{
		api.patch('/semaphore/semaKeyU0/'+checkHandle)
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	EXP+=60000;
	    	assert.equal(res['body']['message']['expiry'],EXP);
	    	done();	
	    })
	});

	it('Update set ttl<0 / should error',(done)=>{
		api.patch('/semaphore/semaKeyU0/'+checkHandle)
		.set('Content-Type', 'application/json')
		.send('{"ttl":"-3"}')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

	it('Update set ttl=0 / should error',(done)=>{
		api.patch('/semaphore/semaKeyU0/'+checkHandle)
		.set('Content-Type', 'application/json')
		.send('{"ttl":0}')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

	it('Update set ttl>=3600sec / should error',(done)=>{
		api.patch('/semaphore/semaKeyU0/'+checkHandle)
		.set('Content-Type', 'application/json')
		.send('{"ttl":3601}')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

	it('Update set ttl=30sec / delay 30sec',(done)=>{
		api.patch('/semaphore/semaKeyU0/'+checkHandle)
		.set('Content-Type', 'application/json')
		.send('{"ttl":30}')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	EXP+=30000;
	    	assert.equal(res['body']['message']['expiry'],EXP);
	    	done();	
	    })
	});

	it('semaKeyU0 Delete',(done)=>{
		api.delete('/semaphore/semaKeyU0/'+checkHandle)
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })
	});

	it('query again, not exist',(done)=>{
		api.get('/semaphore/semaKeyU0')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

	it('Update should error',(done)=>{
		api.patch('/semaphore/semaKeyU0/'+checkHandle)
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

});


// = = = = = LOCK / RELEASE = = = = =

describe('Semaphore LOCK and RELEASE',()=>{

	it('semaKeyL0 create',(done)=>{
		api.post('/semaphore/semaKeyL0')
	    .set('Content-Type', 'application/json')
	    .send('{"ttl":300,"maxCapacity":3}')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
    		checkHandle=res['body']['message']['handle'];
    		EXP = res['body']['message']['expiry'];
			assert.equal(res['body']['message']['id'],'semaKeyL0');
			assert.equal(res['body']['message']['maxCapacity'],3);
			done();
	    })	
	});

	it('lock with WRONG handle',(done)=>{
		api.post('/semaphore/semaKeyL0/abcdefg12345908xyz')
	    .expect(409)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['body']['message'],'out of lock maxCapacity / lock not been created or invaild request / or Wrong handle');
			done();
	    })	
	});

	it('query, count should not increase',(done)=>{
		api.get('/semaphore/semaKeyL0')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['body']['message']['id'],'semaKeyL0');
	    	assert.equal(res['body']['message']['expiry'],EXP);
	    	assert.equal(res['body']['message']['remain/maxCapacity'],"3/3");
	    	done();	
	    })
	});


	it('release when count 0',(done)=>{
		api.put('/semaphore/semaKeyL0/'+checkHandle)
	    .expect(409)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['body']['message'],'lock released on maxCapacity or Wrong handle');
			done();
	    })	
	});

	it('query, count should 0',(done)=>{
		api.get('/semaphore/semaKeyL0')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['body']['message']['id'],'semaKeyL0');
	    	assert.equal(res['body']['message']['expiry'],EXP);
	    	assert.equal(res['body']['message']['remain/maxCapacity'],"3/3");
	    	done();	
	    })
	});

	it('lock +1 / empty body',(done)=>{
		api.post('/semaphore/semaKeyL0/'+checkHandle)
	    .expect(200)
	    .end((err,res)=>{
	    	EXP+=60000
	    	if(err) return done(err);
	    	assert.equal(res['body']['message']['countInuse'],'1');
	    	assert.equal(res['body']['message']['expiry'],EXP);
	    	assert.equal(res['body']['message']['remainCapacity'],'2');
			done();
	    })	
	});

	it('lock +1 / ttl 10',(done)=>{
		api.post('/semaphore/semaKeyL0/'+checkHandle)
		.set('Content-Type', 'application/json')
	    .send('{"ttl":10}')
	    .expect(200)
	    .end((err,res)=>{
	    	EXP+=10000
	    	if(err) return done(err);
	    	assert.equal(res['body']['message']['countInuse'],'2');
	    	assert.equal(res['body']['message']['expiry'],EXP);
	    	assert.equal(res['body']['message']['remainCapacity'],'1');
			done();
	    })	
	});
	
	it('lock +1 / ttl 0',(done)=>{
		api.post('/semaphore/semaKeyL0/'+checkHandle)
		.set('Content-Type', 'application/json')
	    .send('{"ttl":0}')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })	
	});

	it('lock +1 / ttl >3600',(done)=>{
		api.post('/semaphore/semaKeyL0/'+checkHandle)
		.set('Content-Type', 'application/json')
	    .send('{"ttl":3601}')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })	
	});
	
	it('lock +1 / ttl > 60',(done)=>{
		api.post('/semaphore/semaKeyL0/'+checkHandle)
		.set('Content-Type', 'application/json')
	    .send('{"ttl":61}')
	    .expect(200)
	    .end((err,res)=>{
	    	EXP+=60000
	    	if(err) return done(err);
	    	assert.equal(res['body']['message']['countInuse'],'3');
	    	assert.equal(res['body']['message']['expiry'],EXP);
	    	assert.equal(res['body']['message']['remainCapacity'],'0');
			done();
	    })	
	});
	
	it('query, max 3',(done)=>{
		api.get('/semaphore/semaKeyL0')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['body']['message']['id'],'semaKeyL0');
	    	assert.equal(res['body']['message']['expiry'],EXP);
	    	assert.equal(res['body']['message']['remain/maxCapacity'],"0/3");
	    	done();	
	    })
	});
	
	it('lock +1 full / 409 conflict',(done)=>{
		api.post('/semaphore/semaKeyL0/'+checkHandle)
	    .expect(409)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['body']['message'],'out of lock maxCapacity / lock not been created or invaild request / or Wrong handle');
			done();
	    })	
	});
	
	it('query, still 3',(done)=>{
		api.get('/semaphore/semaKeyL0')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['body']['message']['id'],'semaKeyL0');
	    	assert.equal(res['body']['message']['expiry'],EXP);
	    	assert.equal(res['body']['message']['remain/maxCapacity'],"0/3");
	    	done();	
	    })
	});
	
	it('release with WRONG handle',(done)=>{
		api.put('/semaphore/semaKeyL0/asdfghqw2345689zxy')
	    .expect(409)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['body']['message'],'lock released on maxCapacity or Wrong handle');
			done();
	    })	
	});

	it('query, still 3',(done)=>{
		api.get('/semaphore/semaKeyL0')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['body']['message']['id'],'semaKeyL0');
	    	assert.equal(res['body']['message']['expiry'],EXP);
	    	assert.equal(res['body']['message']['remain/maxCapacity'],"0/3");
	    	done();	
	    })
	});
	
	it('release -1',(done)=>{
		api.put('/semaphore/semaKeyL0/'+checkHandle)
	    .expect(200)
	    .end((err,res)=>{
	    	EXP+=60000
	    	if(err) return done(err);
	    	assert.equal(res['body']['message']['countInuse'],'2');
	    	assert.equal(res['body']['message']['expiry'],EXP);
	    	assert.equal(res['body']['message']['remainCapacity'],'1');
			done();
	    })	
	});

	it('query, 2',(done)=>{
		api.get('/semaphore/semaKeyL0')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['body']['message']['id'],'semaKeyL0');
	    	assert.equal(res['body']['message']['expiry'],EXP);
	    	assert.equal(res['body']['message']['remain/maxCapacity'],"1/3");
	    	done();	
	    })
	});
	
	it('delete',(done)=>{
		api.delete('/semaphore/semaKeyL0/'+checkHandle)
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })
	});

	it('query , not exist',(done)=>{
		api.get('/semaphore/semaKeyL0')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});
	
	it('lock +1 / error',(done)=>{
		api.post('/semaphore/semaKeyL0/'+checkHandle)
	    .expect(409)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['body']['message'],'out of lock maxCapacity / lock not been created or invaild request / or Wrong handle');
			done();
	    })	
	});

	it('query , not exist',(done)=>{
		api.get('/semaphore/semaKeyL0')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});
	
	it('release / error',(done)=>{
		api.put('/semaphore/semaKeyL0/'+checkHandle)
	    .expect(409)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['body']['message'],'lock released on maxCapacity or Wrong handle');
			done();
	    })	
	});

});




//.set('Content-Type', 'application/json')
//.send('{"ttl":2,"maxCapacity":2}')

// console.log(err['response']['body'],err['response']['statusCode']);

//+1/-1
// "message": {
//   "countInuse": 0,
//   "expiry": 1534494247163,
//   "remainCapacity": 15
// }

//UPDATE
// "message": {
// 	 "expiry": 1534491688818
// }

// QUERY
// "message": {
//   "id": "sema01",
//   "expiry": 1533800951556,
//   "remain/maxCapacity": "15/15"
// }

// res { id: 'semaKeyC0',
// handle: '57ba631a-55de-4500-b7e0-a63db8e0a53f',
// countInuse: 0,
// remainCapacity: 5,
// maxCapacity: 5,
// expiry: 1533924847445 } 200
