local delpattern = KEYS[1]
local count = 0
local valuelist = redis.call('keys', delpattern)
if valuelist then
    for i = 1, #valuelist do
        redis.call('del', valuelist[i])
        count = count + 1
    end
end
return count
