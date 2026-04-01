#!/bin/bash
set -a
source .env.local
set +a

export ANDROID_HOME=${ANDROID_HOME:-/home/suporte/Android/Sdk}
export JAVA_HOME=${JAVA_HOME:-/usr/lib/jvm/java-11-openjdk-amd64}
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools

npm start

