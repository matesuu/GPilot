#!/usr/bin/env bash

set -euo pipefail

export JAVA_HOME=/home/username/java/jdk-21.0.10+7
export NEO4J_CONF=/home/username/neo4j/conf
export NEO4J_HOME=/var/lib/neo4j

if /usr/bin/pgrep -f 'org.neo4j.server.Neo4jCommunity' >/dev/null 2>&1; then
  exit 0
fi

exec /usr/share/neo4j/bin/neo4j start
