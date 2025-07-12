This project is a simple news website that allows users to read and comment on public stories. Accounts with Author permissions are allowed to publish there own stories
The project has a micro-service structure with 3 three different back-end API's to manage the displayed advertisements, articles, and user authentication. 

Data is persistance with MongoDB server conncected with Express node servers.

Simple cookie system persists log in status while broweser is open.

This project is probably not easily reproduceable right now as the front-end html files are served with an Apache reverse-proxy to my configured directory.
I will look to change this later

Hypothetical steps to run
1. Apache Server on Port 8080 with configured proxy pass
2. Run all 3 js node servers in `back` directory
3. Run MongoDB server on default port (would likely need to create the proper collections)
4. configure `anon-view.html` to Apache and open it browser
