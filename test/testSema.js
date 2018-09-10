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
		api.put('/semaphore/semaKeyC0')
	    .set('Content-Type', 'application/json')
	    .send('{"seats":5}')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
			assert.equal(res['body']['message']['id'],'semaKeyC0');
			assert.equal(res['body']['message']['seatTotal'],5);
			assert.equal(res['body']['message']['seatVaild'],5);
			done();
	    })	
	});

	it('semaKeyC0 / create same key expiry',(done)=>{
		api.put('/semaphore/semaKeyC0')
	    .set('Content-Type', 'application/json')
	    .send('{"seats":12}')
	    .expect(409)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['statusCode'],409);
	    	done();
	    })	
	});

});

describe('Semaphore CREATE (ttl forbidden)',()=>{

	it('semaKeyC1 / create no body / 200',(done)=>{
		api.put('/semaphore/semaKeyC1')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })	
	});

	it('query not exist',(done)=>{
		api.get('/semaphore/semaKeyC1')
	    .expect(404)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

	it('semaKeyC1 / create ttl seat = 0',(done)=>{
		api.put('/semaphore/semaKeyC1')
	    .set('Content-Type', 'application/json')
	    .send('{"seats":0}')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })	
	});

	it('query not exist',(done)=>{
		api.get('/semaphore/semaKeyC1')
	    .expect(404)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

});


// = = = = = DELETE = = = = =

describe('Semaphore DELETE',()=>{

	it('semaKeyD0 / create',(done)=>{
		api.put('/semaphore/semaKeyD0')
		.set('Content-Type', 'application/json')
	    .send('{"seats":5}')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
			assert.equal(res['body']['message']['id'],'semaKeyD0');
			assert.equal(res['body']['message']['seatTotal'],5);
			assert.equal(res['body']['message']['seatVaild'],5);
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

	//add 1
	it('semaKeyD0 / aquire one seat',(done)=>{
		api.put('/semaphore/semaKeyD0/Seat')
		.set('Content-Type', 'application/json')
	    .send('{"ttl":60}')
	    .expect(200)
	    .end((err,res)=>{
			if(err) return done(err);
			let keyArr=Object.keys(res['body']['message']['seat']);
			checkHandle=(keyArr[0]=='DefaultHandle') ? keyArr[1] : keyArr[0]
			EXP = res['body']['message']['seat'][checkHandle]
			done();
	    })	
	});

	it('query again,should decrease 1 seat',(done)=>{
		api.get('/semaphore/semaKeyD0')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
			assert.equal(res['body']['message']['id'],'semaKeyD0');
			assert.equal(res['body']['message']['seatTotal'],5);
			assert.equal(res['body']['message']['seatVaild'],4);
	    	done();	
	    })
	});

	it('semaKeyD0 delete',(done)=>{
		api.delete('/semaphore/semaKeyD0')
	    .expect(401)
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
			assert.equal(res['body']['message']['seatTotal'],5);
			assert.equal(res['body']['message']['seatVaild'],4);
	    	done();	
	    })
	});

	it('semaKeyD0 release seat',(done)=>{
		api.delete('/semaphore/semaKeyD0/Seat')
		.set('Content-Type', 'application/json')
	    .send(`{"handle":"${checkHandle}"}`)
	    .expect(200)
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
			assert.equal(res['body']['message']['seatTotal'],5);
			assert.equal(res['body']['message']['seatVaild'],5);
	    	done();	
	    })
	});

	it('semaKeyD0 delete should success',(done)=>{
		api.delete('/semaphore/semaKeyD0')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })
	});

	it('query again, not exist',(done)=>{
		api.get('/semaphore/semaKeyD0')
	    .expect(404)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

	it('semaKeyD0 not exist when delete',(done)=>{
		api.delete('/semaphore/semaKeyD0')
	    .expect(401)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })
	});


});


// = = = = = UPDATE = = = = =

describe('Semaphore UPDATE',()=>{

	it('semaKeyU0 / create',(done)=>{
		api.put('/semaphore/semaKeyU0')
		.set('Content-Type', 'application/json')
	    .send('{"seats":5}')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);	    	
			assert.equal(res['body']['message']['id'],'semaKeyU0');
			assert.equal(res['body']['message']['seatTotal'],5);
			assert.equal(res['body']['message']['seatVaild'],5);
			done();
	    })	
	});

	it('semaKeyU0 / quire seat',(done)=>{
		api.put('/semaphore/semaKeyU0/Seat')
		.set('Content-Type', 'application/json')
	    .send('{"ttl":60}')
	    .expect(200)
	    .end((err,res)=>{
			if(err) return done(err);
			let keyArr=Object.keys(res['body']['message']['seat']);
			checkHandle=(keyArr[0]=='DefaultHandle') ? keyArr[1] : keyArr[0]
			EXP = res['body']['message']['seat'][checkHandle]
			done();
	    })	
	});

	it('query ,should exist',(done)=>{
		api.get('/semaphore/semaKeyU0')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['body']['message']['seat'][checkHandle],EXP);
	    	done();	
	    })
	});

	it('Update with WRONG handle',(done)=>{
		api.patch('/semaphore/semaKeyU0/Seat')
		.set('Content-Type', 'application/json')
	    .send('{"ttl":60,"handle":"sdfgaro8340u"}')
	    .expect(401)
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
	    	assert.equal(res['body']['message']['seat'][checkHandle],EXP);
	    	done();	
	    })
	});

	it('Update with empty body / delay 60sec',(done)=>{
		api.patch('/semaphore/semaKeyU0/Seat')
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

	it('Update set ttl=0 / should error',(done)=>{
		api.patch('/semaphore/semaKeyU0/Seat')
		.set('Content-Type', 'application/json')
		.send(`{"ttl":0,"handle":"${checkHandle}"}`)
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

	it('Update set ttl>3600 / should error',(done)=>{
		api.patch('/semaphore/semaKeyU0/Seat')
		.set('Content-Type', 'application/json')
		.send(`{"ttl":3601,"handle":"${checkHandle}"}`)
	    .expect(400)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

	it('Update set ttl=30sec / delay 30sec',(done)=>{
		api.patch('/semaphore/semaKeyU0/Seat')
		.set('Content-Type', 'application/json')
		.send(`{"ttl":30,"handle":"${checkHandle}"}`)
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	EXP+=30000;
	    	assert.equal(res['body']['message']['seat'][checkHandle],EXP);
	    	done();	
	    })
	});

	it('semaKeyU0 seat release',(done)=>{
		api.delete('/semaphore/semaKeyU0/Seat')
		.set('Content-Type', 'application/json')
		.send(`{"handle":"${checkHandle}"}`)
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
			done();
	    })
	});

	it('query again, not exist',(done)=>{
		api.get('/semaphore/semaKeyU0')
	    .expect(200)
	    .end((err,res)=>{
			if(err) return done(err);
			assert.equal(res['body']['message']['id'],"semaKeyU0");
			assert.equal(res['body']['message']['seatTotal'],5);
			assert.equal(res['body']['message']['seatVaild'],5);
			assert.equal(res['body']['message']['seat'][checkHandle],0);
	    	done();	
	    })
	});

	it('Update should error',(done)=>{
		api.patch('/semaphore/semaKeyU0/Seat')
		.set('Content-Type', 'application/json')
		.send(`{"ttl":30,"handle":"${checkHandle}"}`)
	    .expect(401)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	done();	
	    })
	});

});


// = = = = = LOCK / RELEASE = = = = =

describe('Semaphore LOCK and RELEASE',()=>{

	it('semaKeyL0 create',(done)=>{
		api.put('/semaphore/semaKeyL0')
	    .set('Content-Type', 'application/json')
	    .send('{"seats":1}')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
			assert.equal(res['body']['message']['id'],'semaKeyL0');
			assert.equal(res['body']['message']['seatTotal'],1);
			assert.equal(res['body']['message']['seatVaild'],1);
			done();
	    })	
	});

	it('lock +1',(done)=>{
		api.put('/semaphore/semaKeyL0/Seat')
		.set('Content-Type', 'application/json')
	    .send('{"ttl":1}')
	    .expect(200)
	    .end((err,res)=>{
			if(err) return done(err);
			let keyArr=Object.keys(res['body']['message']['seat']);
			checkHandle=(keyArr[0]=='DefaultHandle') ? keyArr[1] : keyArr[0]
			EXP = res['body']['message']['seat'][checkHandle]
			done();
	    })	
	});

	it('query, vaild should decrease',(done)=>{
		api.get('/semaphore/semaKeyL0')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['body']['message']['id'],'semaKeyL0');
	    	assert.equal(res['body']['message']['seatTotal'],1);
	    	assert.equal(res['body']['message']['seatVaild'],0);
	    	done();	
	    })
	});

	it('lock +1 when expiry,success and replace',(done)=>{
		setTimeout(()=>{
			api.put('/semaphore/semaKeyL0/Seat')
			.set('Content-Type', 'application/json')
			.send('{"ttl":600}')
			.expect(200)
			.end((err,res)=>{
				if(err) return done(err);
				let keyArr=Object.keys(res['body']['message']['seat']);
				let newCheckHandle=(keyArr[0]=='DefaultHandle') ? keyArr[1] : keyArr[0]
				assert.notEqual(newCheckHandle,checkHandle);
				checkHandle= newCheckHandle;
				EXP= res['body']['message']['seat'][checkHandle];
				done();
			})
		},1500);
	});

	it('query, vaild should equal 0',(done)=>{
		api.get('/semaphore/semaKeyL0')
	    .expect(200)
	    .end((err,res)=>{
	    	if(err) return done(err);
	    	assert.equal(res['body']['message']['id'],'semaKeyL0');
	    	assert.equal(res['body']['message']['seatTotal'],1);
	    	assert.equal(res['body']['message']['seatVaild'],0);
	    	done();	
	    })
	});

	it('lock +1 when not expiry,faild',(done)=>{
		api.put('/semaphore/semaKeyL0/Seat')
		.set('Content-Type', 'application/json')
	    .send('{"ttl":60}')
	    .expect(409)
	    .end((err,res)=>{
			if(err) return done(err);
			done();
	    })	
	});

	it('query, vaild should equal 0',(done)=>{
		api.get('/semaphore/semaKeyL0')
	    .expect(200)
	    .end((err,res)=>{
			if(err) return done(err);
			assert.equal(res['body']['message']['id'],'semaKeyL0');
	    	assert.equal(res['body']['message']['seatTotal'],1);
			assert.equal(res['body']['message']['seatVaild'],0);
			let keyArr=Object.keys(res['body']['message']['seat']);
			let checkHandle2=(keyArr[0]=='DefaultHandle') ? keyArr[1] : keyArr[0]
	    	assert.equal(checkHandle2,checkHandle);
	    	assert.equal(res['body']['message']['seat'][checkHandle],EXP);
	    	done();	
	    })
	});

	it('lock -1',(done)=>{
		api.delete('/semaphore/semaKeyL0/Seat')
		.set('Content-Type', 'application/json')
	    .send(`{"handle":"${checkHandle}"}`)
	    .expect(200)
	    .end((err,res)=>{
			if(err) return done(err);
			done();
	    })	
	});

	it('query, vaild should equal 1',(done)=>{
		api.get('/semaphore/semaKeyL0')
	    .expect(200)
	    .end((err,res)=>{
			if(err) return done(err);
			assert.equal(res['body']['message']['id'],'semaKeyL0');
	    	assert.equal(res['body']['message']['seatTotal'],1);
	    	assert.equal(res['body']['message']['seatVaild'],1);
	    	assert.equal(res['body']['message']['seat'][checkHandle],0);
	    	done();	
	    })
	});

	it('lock -1,when Vaild is full',(done)=>{
		api.delete('/semaphore/semaKeyL0/Seat')
		.set('Content-Type', 'application/json')
	    .send(`{"handle":"${checkHandle}"}`)
	    .expect(401)
	    .end((err,res)=>{
			if(err) return done(err);
			done();
	    })	
	});

	it('query, vaild should equal 1',(done)=>{
		api.get('/semaphore/semaKeyL0')
	    .expect(200)
	    .end((err,res)=>{
			if(err) return done(err);
			assert.equal(res['body']['message']['id'],'semaKeyL0');
	    	assert.equal(res['body']['message']['seatTotal'],1);
	    	assert.equal(res['body']['message']['seatVaild'],1);
	    	assert.equal(res['body']['message']['seat'][checkHandle],0);
	    	done();	
	    })
	});
});