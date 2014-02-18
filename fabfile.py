from datetime import datetime
from fabric.api import env
from fabric.colors import green
from fabric.decorators import task
from fabric.operations import local
from fabric.utils import puts


@task
def up():
    local('git add --all')
    local('git commit  -m "{}"'.format("New post for %s" % (datetime.now())))
    local('git push')
    puts(green('Posts Updated'))
