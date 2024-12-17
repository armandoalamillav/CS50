# The Dockerfile describes the instructions for creating a docker image
# A docker image represents all of the libraries and other installed items
# that we want to have on the container.
# Based on that image we can create multiple identical containers

# Line 7 is another Docker image from which I'm going to base this Dockerfile
FROM python:3
# Copy everything in . (my current directory) into my container. 
# Store the container in /usr/src/app
COPY .  /usr/src/app
# Set my working directory equal to my app directory above
WORKDIR /usr/src/app
# Install all my requirements. Assume that I've added all my requirements in
# a requirements.txt file
RUN pip install -r requirements.txt
# Command that should run when I start up the container
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
