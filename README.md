#<span style="color:#09f">Distributed Lock
the distributed lock is base on AWS dynamodb.


##<span style="color:#059">SET CREDENTIALS FIRST
please set the credential before you use the distributed lock API
path : <span style="color:#f00">`.aws/credentials`</span>
more detal on [Getting an AWS Access Key](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SettingUp.DynamoWebService.html#SettingUp.DynamoWebService.GetCredentials).

##<span style="color:#059">Running the server
To run the server, run:

```
npm start
```

To view the Swagger UI interface:

```
open http://localhost:8080/docs
```

Testing:

	npm test

##<span style="color:#059">Using Locks

###<span style="color:#fc0">Semaphore

####<span style="color:#059">Create

Request

	POST
	http://localhost:8080/v1/semaphore/{semaKey}
		
	BODY(optional)
	{ "ttl": [1~3600] , "maxCapacity": [>0] }
	//default ttl 60 , maxCapacity 15
Respond example : 

200

	"message":{
		id: 'semaKeyC0',
		handle: '57ba631a-55de-4500-b7e0-a63db8e0a53f',
		countInuse: 0,
		remainCapacity: 5,
		maxCapacity: 5,
		expiry: 1533924847445
	}
409

	"message":{
		"lock conflict/in use or invaild request"
	}

400 input error

	"message":{
		"invaild request"
	}
	
####<span style="color:#059">Delete
Request

	DELETE
	http://localhost:8080/v1/semaphore/{semaKey}/{semaHandle}
Respond Sample :  

200

	"message":{
		"delete Lock success"
	}
400

	"message":{
		"error or invaild request"
	}
400 input error

	"message":{
		"invaild request"
	}
	
	
####<span style="color:#059">Lock
Request

	POST(+1)
	http://localhost:8080/v1/semaphore/{semaKey}/{semaHandle}
	
	BODY(optional)
	{ "ttl": [1~60] }
	//default 60
Respond Sample :

200

	"message": {
	  "countInuse": 0,
	  "expiry": 1534494247163,
	  "remainCapacity": 15
	}

409

	"message": {
		"lock released on maxCapacity or Wrong handle"
	}
	
400 input error

	"message":{
		"invaild request"
	}

	
####<span style="color:#059">Release
Request

	PUT(-1)
	http://localhost:8080/v1/semaphore/{semaKey}/{semaHandle}
	
Respond Sample :

200

	"message": {
	  "countInuse": 0,
	  "expiry": 1534494247163,
	  "remainCapacity": 15
	}

409

	"message": {
		"lock released on maxCapacity or Wrong handle"
	}
	
400 input error

	"message":{
		"invaild request"
	}
	
####<span style="color:#059">Update
Request

	PATCH
	http://localhost:8080/v1/semaphore/{semaKey}/{semaHandle}
	
	BODY(optional)
	{ "ttl": [1~3600] }
	//default 60
	
Respond Sample :

200

	"message": {
	 "expiry": 1534491688818
	}
400

	"message":{
		"error or invaild request"
	}
400 input error

	"message":{
		"invaild request"
	}
	
####<span style="color:#059">Query
Request

	GET
	http://localhost:8080/v1/semaphore/{semaKey}/
	
Respond Sample :
	
200

	"message": {
	  "id": "sema01",
	  "expiry": 1533800951556,
	  "remain/maxCapacity": "15/15"
	}
400

	"message":{
		"lock not exist or invaild request"
	}
400 input error

	"message":{
		"invaild request"
	}



###<span style="color:#fc0">Mutex

####<span style="color:#059">Create
Request

	PUT
	http://localhost:8080/v1/mutex/{mutexKey}

	BODY(optional)
	{ "ttl": [1~3600] }
	//default 60
	
Respond Sample :

200

	"message":{
		"id": "muA",
		"handle": "ca1e020a-079e-4a56-b0cc-44c490d6f86c",
		"expiry": 1534501106693,
		"locked": true
	}
409

	"message":{
		"lock conflict/in use or invaild request"
	}

400 input error

	"message":{
		"invaild request"
	}
	
####<span style="color:#059">Delete
Request

	DELETE
	http://localhost:8080/v1/mutex/{mutexKey}/{mutexHandle}
Respond Sample :

200

	"message":{
		"delete Lock success"
	}
400

	"message":{
		"error or invaild request"
	}
400 input error

	"message":{
		"invaild request"
	}
	
####<span style="color:#059">Update
Request

	PATCH
	http://localhost:8080/v1/mutex/{mutexKey}/{mutexHandle}

	BODY(optional)
	{ "ttl": [1~3600] }
	//default 60
Respond Sample :

200

	"message": {
	 "expiry": 1534491688818
	}
400

	"message":{
		"error or invaild request"
	}
400 input error

	"message":{
		"invaild request"
	}
	
####<span style="color:#059">Query
Request

	GET
	http://localhost:8080/v1/mutex/{mutexKey}
Respond Sample :	

200

	"message": {
	  "id": "muA",
	  "expiry": 1533110678373
	}
400

	"message":{
		"lock not exist or invaild request"
	}
400 input error

	"message":{
		"invaild request"
	}




