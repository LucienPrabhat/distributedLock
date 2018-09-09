'use strict';
let assert = require('assert');
const supertest = require('supertest');
const api = supertest('http://localhost:8080/v1');
let checkHandle = 'default';
let EXP = 0;

// search => CREATE / DELETE / UPDATE


// = = = = = CREATE = = = = =

describe('mutex CREATE (basic)',()=>{

	it('mutexKeyC0 / create',(done)=>{
		api.put('/mutex/mutexKeyC0')
	    .set('Content-Type', 'application/json')
	    .send('{"ttl":1}')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
    		checkHandle=res['body']['message']['handle'];
    		EXP = res['body']['message']['expiry'];
			assert.equal(res['body']['message']['id'],'mutexKeyC0');
			done();
	    })	
	});

	it('mutexKeyC0 / create same key BEFORE expiry',(done)=>{
		api.put('/mutex/mutexKeyC0')
	    .set('Content-Type', 'application/json')
	    .send('{"ttl":2}')
	    .expect(409)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['statusCode'],409);
	    	done();
	    })	
	});

	//wait 1 sec
	it('mutexKeyC0 / create same key AFTER expiry',(done)=>{
		setTimeout(()=>{
			api.put('/mutex/mutexKeyC0')
		    .set('Content-Type', 'application/json')
		    .send('{"ttl":10}')
		    .expect(200)
		    .end((err,res)=>{
		    	if(err) return done(err);
	    		assert.notEqual(res['body']['message']['handle'],checkHandle);
	    		assert.equal(res['body']['message']['id'],'mutexKeyC0');
				done();
		    })
	    },1800);
	}).timeout(5000);

});

describe('mutex CREATE (ttl forbidden)',()=>{

	it('mutexKeyC1 / create (empty body)',(done)=>{
		api.put('/mutex/mutexKeyC1')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })	
	});

	it('mutexKeyC2 / ttl = 0 ',(done)=>{
		api.put('/mutex/mutexKeyC2')
	    .set('Content-Type', 'application/json')
	    .send('{"ttl":0}')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();
	    })	
	});

	it('mutexKeyC3 / ttl > 3600 ',(done)=>{
		api.put('/mutex/mutexKeyC3')
	    .set('Content-Type', 'application/json')
	    .send('{"ttl":3601}')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();
	    })	
	});

	it('C1 not exist',(done)=>{
		api.get('/mutex/mutexKeyC1')
	    .expect(404)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

	it('C2 not exist',(done)=>{
		api.get('/mutex/mutexKeyC2')
	    .expect(404)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

	it('C3 not exist',(done)=>{
		api.get('/mutex/mutexKeyC3')
	    .expect(404)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

});


// = = = = = DELETE = = = = =

describe('mutex DELETE',()=>{

	it('mutexKeyD0/ create',(done)=>{
		api.put('/mutex/mutexKeyD0')
		.set('Content-Type', 'application/json')
	    .send('{"ttl":60}')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);	    	
    		checkHandle=res['body']['message']['handle'];
    		EXP = res['body']['message']['expiry'];
			assert.equal(res['body']['message']['id'],'mutexKeyD0');
			done();
	    })	
	});

	it('query if exist',(done)=>{
		api.get('/mutex/mutexKeyD0')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['body']['message']['id'],'mutexKeyD0');
	    	done();	
	    })
	});

	it('mutexKeyD0 delete with WRONG handle',(done)=>{
		api.delete('/mutex/mutexKeyD0')
		.set('Content-Type', 'application/json')
	    .send('{"handle":"abcdefg098765xyz"}')
	    .expect(401)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })
	});

	it('query again,should still exist',(done)=>{
		api.get('/mutex/mutexKeyD0')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['body']['message']['id'],'mutexKeyD0');
	    	done();	
	    })
	});

	it('mutexKeyD0 delete with CORRECT handle',(done)=>{
		api.delete('/mutex/mutexKeyD0')
		.set('Content-Type', 'application/json')
	    .send(`{"handle":"${checkHandle}"}`)
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })
	});

	it('query again, not exist',(done)=>{
		api.get('/mutex/mutexKeyD0')
	    .expect(404)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

	it('mutexKeyD0 not exist when delete',(done)=>{
		api.delete('/mutex/mutexKeyD0')
		.set('Content-Type', 'application/json')
	    .send(`{"handle":"${checkHandle}"}`)
	    .expect(401)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })
	});


});


// = = = = = UPDATE = = = = =

describe('mutex UPDATE',()=>{

	it('mutexKeyU0 / create',(done)=>{
		api.put('/mutex/mutexKeyU0')
		.set('Content-Type', 'application/json')
	    .send('{"ttl":60}')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);	    	
    		checkHandle = res['body']['message']['handle'];
    		EXP = res['body']['message']['expiry'];
			assert.equal(res['body']['message']['id'],'mutexKeyU0');
			done();
	    })	
	});

	it('query ,should exist',(done)=>{
		api.get('/mutex/mutexKeyU0')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['body']['message']['id'],'mutexKeyU0');
	    	done();	
	    })
	});

	it('Update with WRONG handle',(done)=>{
		api.patch('/mutex/mutexKeyU0')
		.set('Content-Type', 'application/json')
	    .send('{"ttl":60,"handle":"abcdefg0987xye34zz"}')
	    .expect(401)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

	it('query ,should not change anything',(done)=>{
		api.get('/mutex/mutexKeyU0')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['body']['message']['id'],'mutexKeyU0');
	    	assert.equal(res['body']['message']['expiry'],EXP);
	    	done();	
	    })
	});

	it('Update with empty body / delay 60sec',(done)=>{
		api.patch('/mutex/mutexKeyU0')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

	it('Update set one args / should error',(done)=>{
		api.patch('/mutex/mutexKeyU0')
		.set('Content-Type', 'application/json')
	    .send(`{"handle":"${checkHandle}"}`)
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

	it('Update set ttl=0 / should error',(done)=>{
		api.patch('/mutex/mutexKeyU0')
		.set('Content-Type', 'application/json')
	    .send(`{"ttl":0,"handle":"${checkHandle}"}`)
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

	it('Update set ttl>=3600sec / should error',(done)=>{
		api.patch('/mutex/mutexKeyU0')
		.set('Content-Type', 'application/json')
	    .send(`{"ttl":3601,"handle":"${checkHandle}"}`)
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

	it('Update set ttl=30sec / delay 30sec',(done)=>{
		api.patch('/mutex/mutexKeyU0')
		.set('Content-Type', 'application/json')
	    .send(`{"ttl":30,"handle":"${checkHandle}"}`)
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	EXP+=30000;
	    	assert.equal(res['body']['message']['expiry'],EXP);
	    	done();	
	    })
	});

	it('mutexKeyU0 Delete',(done)=>{
		api.delete('/mutex/mutexKeyU0')
		.set('Content-Type', 'application/json')
		.send(`{"ttl":0,"handle":"${checkHandle}"}`)
		.expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })
	});

	it('query again, not exist',(done)=>{
		api.get('/mutex/mutexKeyU0')
	    .expect(404)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

	it('Update should error',(done)=>{
		api.patch('/mutex/mutexKeyU0')
		.set('Content-Type', 'application/json')
		.send(`{"ttl":30,"handle":"${checkHandle}"}`)
	    .expect(401)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

});
