# Requirements
- Redis
- NPM
- Node.js

# Redis installation
```shell
wget http://download.redis.io/redis-stable.tar.gz
tar xvzf redis-stable.tar.gz
cd redis-stable
make
sudo make install
```
After installation ends, open a new terminal and star the server by typing 'redis-server'

# NPM installation
```shell
curl -L https://www.npmjs.com/install.sh | sh
```

# Node installation
```shell
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash
export NVM_DIR="$HOME/.nvm" [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm
nvm alias default 6.8
```

# Usage
After installing everything just cd into the project's folder and start it by typing:
```shell
npm start
```
After running the command you can access the app by accessing http://localhost:3000/ in your browser.
If you wish to perform simple automated tests in the API, I've included some postman test files in the root of the project.
