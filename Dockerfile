#get latest python docker image
FROM python:slim

#create working dir
RUN mkdir /usr/src/app

#use working dir
WORKDIR /usr/src/app

#set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

#upgrade pip
RUN pip install --upgrade pip

#copy requirements.txt to /usr/src/app
COPY ./requirements.txt .

#install dependencies  with pip
RUN pip install -r requirements.txt

#copy project in cureent directory to working directory = /usr/src/app
COPY . .

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]