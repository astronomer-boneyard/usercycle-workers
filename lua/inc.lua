local function inc(key)
  local val = redis.pcall("INCR", key)
  redis.pcall("EXPIRE", key, 60)
  return val
end

if redis.pcall("EXISTS", KEYS[1]) == 1 then
  local current = redis.pcall("GET", KEYS[1])
  if tonumber(current) == 5 then
    return nil
  else
    return inc(KEYS[1])
  end
else
  return inc(KEYS[1])
end