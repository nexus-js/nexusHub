# Deploy a Dockerized distributed smartphone speaker composition using Hyper.sh

## Installation and Setup

### Node

If you don't already have node installed you can find it [here](https://nodejs.org/en/).

Test installation:

```bash
node -v
```

### Docker

Download and install [Docker Community Edition](https://docs.docker.com/install/). This allows you to create a Docker image and container.

Open the Docker application then create a Docker ID. This gives you access to DockerHub, a cloud-based image registry service, which we will use to deploy our app.

After Docker CE is installed sign in to Docker Cloud on your local system to allow for pushing repositories. On a Mac sign in can be found by clicking on the Docker icon in the menu bar.

Test installation:

```bash
docker version
```

### Hyper.sh

Sign up for an account on Hyper.sh. You get 2 months of limited service for free after adding a credit card.

Follow the instructions to generate an [API credential](https://docs.hyper.sh/hyper/GettingStarted/generate_api_credential.html). Then install the [CLI](https://docs.hyper.sh/hyper/GettingStarted/install.html) and configure with your API credentials.

## Dockerizing our composition

It is important that before this step Docker is installed, running, and that you are signed in with your Docker ID.

### Creating a Docker Image

A Dockerfile is a configuration file for Docker that instructs Docker how to build an image. Add the following to a file named `Dockerfile`:

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

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

# Our app runs on port 8000. Expose it!
# Using 8001 with Docker to be able to test it separate from running the server outside of Docker
EXPOSE 3001:3000

# Run the application.
CMD ["npm", "start"]
```

With the the `Dockerfile` now in your root directory we will build the image locally and also add a tag for uploading to DockerHub in the next step. The tag naming convention is `{dockerHub username}/{dockerhub repository name}`. In further examples replace my tag with yours.

```
docker build . -t tatecarson/nexus-hub
```

### Run locally

Now run your container locally to see that it works. Map the container port to your machines port with `-p`.

```
docker run -p 3001:3000 tatecarson/nexus-hub
```

## Deploy

### DockerHub

Now push to DockerHub:

```
docker push tatecarson/nexus-hub
```

### Hyper

Now we can run a few commands to get our app running on Hyper. You will notice that the commands are similar to GitHub's, making them easier to remember.

First we pull from DockerHub to Hyper:

```
hyper pull tatecarson/nexus-hub
```

Run the container on Hyper. Below we run in detached mode, name our app on Hyper and explicitly publish ports then tell Hyper we want ot run the app we just pulled.

```
hyper run -d --name nexus-hub -p 3001:3000 tatecarson/nexus-hub
```

To expose your app to the world you need to allocate a floating IP or `fip`. Only do this once per app as they are billed at a different rate.

```
hyper fip allocate 1
```

Attach that IP to your app:

```
hyper fip attach 209.177.91.57 nexus-hub
```

It is very easy to remove and turn off your app when it is not in use. This is very helpful to control cost.

Stop the app:

```
hyper stop nexus-hub
```

Remove the container

```
hyper rm -f nexus-hub
```

Remove the image associated with the container

```
hyper rmi tatecarson/nexus-hub
```

I have collected all of the previous commands in a bash script to simplify deployment and cleanup.

#### Deploy

`_deployHyper.sh`

```bash
#!/bin/bash

docker build . -t tatecarson/nexus-hub
docker push tatecarson/nexus-hub
hyper rm -f nexus-hub
hyper rmi tatecarson/nexus-hub
hyper pull tatecarson/nexus-hub
hyper run -d --name nexus-hub -p 8000:8000 tatecarson/nexus-hub
hyper fip attach 209.177.91.57 nexus-hub
```

#### Remove

`_removeHyper.sh`

```bash
#!/bin/bash

hyper stop nexus-hub
hyper rm nexus-hub
hyper rmi tatecarson/nexus-hub
```
