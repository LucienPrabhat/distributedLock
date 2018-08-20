#<span style="color:#09f">TEST
##<span style="color:#059">semaphore
###<span style="color:#a60">create

	POST
	http://localhost:8080/v1/semaphore/{semaKey}
	semaArgs(body) // { "ttl": [1~3600] , "maxCapacity": [>0] }
	
**normal lock**

- **semaKeyC0**
	1. <span style="color:#ccc">query (not exist)
	- create (set ttl 10 / max.5) <span style="color:#ccc">  and check 3.
	- <span style="color:#ccc">query (check ttl / max.)
	- create the same key before expiry (return error)
	- <span style="color:#aaa">wait expiry (10sec)
	- create the same key after expiry (should be a new handle in obj.)

**test ttl**

- **semaKeyC1**
	1. create (empty body) 200 / expiry 60 / max. 15
	2. delete
	3. query not exist
	1. create (no ttl / set max. 50) 200 / expiry 60 / max. 50
	2. delete
	3. query not exist
	1. create (no max. / set ttl 10) 200 / expiry 10 / max. 15
	2. delete
	3. query not exist
	1. create (max.>3600 / ttl>3600) / 400 bad request
	1. create (max=0 / ttl=0) / 400 bad request
	1. create (max=0 / ttl=10) / 400 bad request
	1. create (max>3600 / ttl=10) / 200
	2. delete
	3. query not exist
	1. create (max=0 / no ttl) / 400 bad request
	1. create (max>3600 / no ttl) / 200
	2. delete
	3. query not exist
	1. create (max=10 / ttl>3600) / 400 bad request
	1. create (max=10 / ttl=0) / 400 bad request
	1. create (no max / ttl>3600) / 400 bad request
	1. create (no max / ttl=0) / 400 bad request
	2. query not exist


###<span style="color:#a60">delete

	DELETE
	http://localhost:8080/v1/semaphore/{semaKey}/{semaHandle}

- **semaKeyD0**
	1. create 
	- query (exist)
	- delete with wrong handle (should error)
	- query (should exist)
	- delete (should success)
	- query (not exist)
	- delete (should error)

###<span style="color:#a60">lock / release

	POST(+1) / PUT(-1)
	http://localhost:8080/v1/semaphore/{semaKey}/{semaHandle}
	
	//(+1)
	semattl(body) // { "ttl": [1~60] }
- **semaKeyL0**
	1. create semaphore (set maxCapacity 3)
	- lock (+1) with wrong handle (error)
	- query (still 0)
	- release (-1) (200 success)
	- query (should still be 0)
	- lock (+1) with empty body / ttl +60 / lock+1
	- lock (+1)(set ttl 10) / ttl +10 / lock +1
	- lock (+1)(set ttl =0) 400 error
	- lock (+1)(set ttl >3600) 400 error
	- lock (+1)(set ttl >60) 60 / ttl +60 / lock +1
	- query (capacity max(3))
	- lock 1 (full / should error)
	- query (still 3)
	- release (-1) with wrong handle (error)
	- query (still 3)
	- release (-1)
	- query (2)
	- delete
	- query (not exist)
	- lock (error)
	- query (not exist)
	- release (error)


###<span style="color:#a60">update

	PATCH
	http://localhost:8080/v1/semaphore/{semaKey}/{semaHandle}
	semattl(body) // { "ttl": [1~3600] }

- **semaKeyU0**
	1. create
	- query (exist / check exp.)
	- update with wrong handle (error)
	- query (exp. should not change)
	- update(empty body)
	- <span style="color:#ccc">query (exp.def +60*1000)
	- update(set ttl <0)
	- <span style="color:#ccc">query (exp.def +60*1000)
	- update(set ttl =0)
	- <span style="color:#ccc">query (exp.def +60*1000) 
	- update(set ttl >3600)
	- <span style="color:#ccc">query (exp.def +3600*1000)
	- update(set ttl 30)
	- <span style="color:#ccc">query (exp. +30*1000)
	- delete semaphore
	- query (not exist)
	- update (error)

##<span style="color:#059">mutex

###<span style="color:#a60">create

	PUT
	http://localhost:8080/v1/mutex/{mutexKey}
	mutexttl(body) // { "ttl": [1~3600] }
	
- __mutexKeyC0__
	1. <span style="color:#ccc">query (not exist)
	- create (set ttl 10)
	- <span style="color:#ccc">query (expiry +10*1000)
	- create the same key before expiry (should error)
	- <span style="color:#aaa">wait expiry (10sec)
	- create the same key
	- <span style="color:#ccc">query (should be a new handle)

**test ttl**

- **mutexKeyC1**
	1. create (empty body) / expiry +60
- **mutexKeyC2**
	- create (ttl=0) / 400 bad request
- **mutexKeyC3**
	- create (ttl>3600) / 400 bad request

###<span style="color:#a60">delete

	DELETE
	http://localhost:8080/v1/mutex/{mutexKey}/{mutexHandle}
- **mutexKeyD0**
	1. create	
	1. query (exist)
	2. delete with wrong handle (should error)
	3. query (should exist)
	- delete (should success)
	- query (not exist)
	- delete (should error)

###<span style="color:#a60">update

	PATCH
	http://localhost:8080/v1/mutex/{mutexKey}/{mutexHandle}
	mutexttl(body) // { "ttl": [1~3600] }

- __mutexKeyU0__	
	1. create
	- query (exist / check exp.)
	- update with wrong handle (error)
	- query (exp. should not change)
	- update(empty body)
	- <span style="color:#ccc">query (exp.def +60*1000)
	- update(set ttl <0)
	- <span style="color:#ccc">query (exp.def +60*1000)
	- update(set ttl =0)
	- <span style="color:#ccc">query (exp.def +60*1000) 
	- update(set ttl >3600)
	- <span style="color:#ccc">query (exp.def +3600*1000)
	- update(set ttl 30)
	- <span style="color:#ccc">query (exp. +30*1000)
	- delete semaphore
	- query (not exist)
	- update (error)
