# Deploy a dockerized distributed smartphone speaker composition using hyper.sh

In this workshop we will deploy a networked dice game to the internet using hyper.sh.

## Installation and Setup

Here is the [start code](https://github.com/tatecarson/chance-airports/archive/nime-workshop.zip) we will be using for the demo. If you get lost feel free to get the finished version [here](https://github.com/tatecarson/chance-airports/tree/master).

### Node

If you don't already have node installed you can find it [here](https://nodejs.org/en/).

Test installation:

```bash
node -v
```

### Docker

Download and install [Docker Community Edition](https://docs.docker.com/install/) for your system. This allows you to create local Docker containers and also to push them to [DockerHub](https://docs.docker.com/docker-hub/), a cloud based registry service for Docker.

Create a Docker ID. This gives you access to DockerHub, which we will use to deploy our app.

After Docker CE is installed sign in to Docker Cloud on your local system to allow for pushing repositories. On a Mac sign in can be found by clicking on the Docker icon in the menu bar.

Test installation:

```bash
docker version
```

### Hyper.sh

Sign up for an account on hyper.sh. You get 2 months of limited service for free after adding a credit card.

Follow the instructions to generate an [API credential](https://docs.hyper.sh/hyper/GettingStarted/generate_api_credential.html). Then install the [CLI](https://docs.hyper.sh/hyper/GettingStarted/install.html) and configure with your API credentials.

## A look at the composition

NOTE: this section will change when i get jesse's app

```
├── .gitignore
├── package.json
├── index.js
├── Dockerfile
├── deployment.yml
├── service.yml
```

## Dockerizing our composition

It is important that before this step docker is installed, running, and that you are signed in with your Docker ID.

### Creating a Docker Image

A Dockerfile is a configuration file for Docker that instruct Docker how to build an image. Add the following to a file named `Dockerfile`:

```bash
#Create our image from Node 6.9-alpine
FROM node:6.9-alpine

#Create a new directory to run our app.
RUN mkdir -p /usr/src/app

#Set the new directory as our working directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install -g rhizome-server
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

# Our app runs on port 8000. Expose it!
# Using 8001 with Docker to be able to test it separate from running the server outside of Docker
EXPOSE 8001:8000

# Specify UDP for OSC communication?
# Same with OSC port 9001 outside of Docker maps to port 9000 used by rhizome
EXPOSE 9001:9000/UDP

# Run the application.
CMD ["npm", "start"]
```

With that the `Dockerfile` now in your root directory run we will build the image locally and also add a tag for uploading to DockerHub in the next step. The tag naming convention is `{dockerHub username}/{dockerhub repository name}`. In further examples replace my tag with yours.

```
docker build . -t tatecarson/dice-game
```

### Run locally

Explain how to test locally inside docker container here

## Deploy

### DockerHub

Now push to DockerHub:

```
docker push tatecarson/dice-game
```

### Hyper

Now we can run a few commands to get our app running on hyper. You will notice that the commands are similar to GitHub's, making them easier to remember.

First we pull from DockerHub to hyper:

```
hyper pull tatecarson/dice-game
```

Run the container on hyper. Below we run in detached mode, name our app on hyper and explicitly publish ports then tell hyper we want ot run the app we just pulled.

```
hyper run -d --name dice-game -p 8000:8000 tatecarson/dice-game
```

To expose your app to the world you need to allocate a floating IP or `fip`. Only do this once per app as they are billed at a different rate.

```
hyper fip allocate 1
```

Attach that IP to your app:

```
hyper fip attach 209.177.91.57 dice-game
```

It is very easy to remove and turn off your app when it is not in use. This is very helpful to control cost.

Stop the app:

```
hyper stop dice-game
```

Remove the container

```
hyper rm -f dice-game
```

Remove the image associated with the container

```
hyper rmi tatecarson/dice-game
```

I have collected all of the previous commands in a bash script to deploy with one command.

#### Deploy

`_deployHyper.sh`

```bash
#!/bin/bash

docker build . -t tatecarson/dice-game
docker push tatecarson/dice-game
hyper rm -f dice-game
hyper rmi tatecarson/dice-game
hyper pull tatecarson/dice-game
hyper run -d --name dice-game -p 8000:8000 tatecarson/dice-game
hyper fip attach 209.177.91.57 dice-game
```

#### Remove

`_removeHyper.sh`

```bash
#!/bin/bash

hyper stop dice-game
hyper rm dice-game
hyper rmi tatecarson/dice-game
```
