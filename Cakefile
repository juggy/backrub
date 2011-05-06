fs            = require("fs")
path          = require("path")
{spawn, exec} = require("child_process")
stdout        = process.stdout

# Use executables installed with npm bundle.
process.env["PATH"] = "node_modules/.bin:#{process.env["PATH"]}"

# ANSI Terminal Colors.
bold  = "\033[0;1m"
red   = "\033[0;31m"
green = "\033[0;32m"
reset = "\033[0m"

# Log a message with a color.
log = (message, color, explanation) ->
  console.log color + message + reset + ' ' + (explanation or '')

# Handle error and kill the process.
onerror = (err)->
  if err
    process.stdout.write "#{red}#{err.stack}#{reset}\n"
    process.exit -1


## Building ##

build = (callback)->
  log "Compiling CoffeeScript to JavaScript ...", green
  exec "rm -rf lib && coffee -c -l -b -o lib src", (err, stdout)->
    onerror err
  exec "coffee -c -l -b -o spec/lib spec", (err, stdout)->
    onerror err
task "build", "Compile CoffeeScript to JavaScript", -> build onerror

task "watch", "Continously compile CoffeeScript to JavaScript", ->
  cmd = spawn("coffee", ["-cw", "-o", "lib", "src"])
  cmd.stdout.on "data", (data)-> process.stdout.write green + data + reset
  cmd.on "error", onerror
  
  cmdTest = spawn("coffee", ["-cw", "-o", "spec/lib", "spec"])
  cmdTest.stdout.on "data", (data)-> process.stdout.write green + data + reset
  cmdTest.on "error", onerror


## Documentation ##

generateDocs = (callback)->
  log "Generating documentation ...", green
  exec "rm -rf docs && docco src/*.coffee  && mv docs/backrub.html docs/index.html", (err, stdout)->
    onerror err

task "doc",        "Generate all documentation",               -> generateDocs onerror

