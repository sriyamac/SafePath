# SafePath
<p> providing real-time updates and keep you safe during emergencies </p>

## initial setup
```
git clone https://github.com/sriyamac/SafePath.git
cd SafePath
```

## frontend setup
```
cd frontend
npm install
```
## backend setup
```
cd backend
python -m venv venv
```
mac:
```
source venv/bin/activate
```
windows: 
```
venv\Scripts\activate
```

```
pip install -r requirements.txt
```

## env variables
Create a `.env file` in the `server` directory to define environment variables
```
GOOGLE_MAPS_API=your_secret_key_here
```

## run frontend
```
cd frontend
npm start
```

## run backend
```
cd backend
flask run
```

Open [http://localhost:3000](http://localhost:3000) to view the frontend, and the backend will run on [http://127.0.0.1:5000](http://localhost:3000).

