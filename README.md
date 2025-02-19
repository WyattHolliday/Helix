# Helix

## About

Helix uses Agentic AI to create HR recruiting outreach sequences

## Local set up

1. Ensure you have Postgresql installed
2. Set up python enviorment in `helix/helix-backend`
3. Run `pip install -r requirements.txt` to install python libraries
4. Set up `.env` file and set `PORT=5000` then `OPENAI_API_KEY` and your Postgresql information in `DB_User` and `DB_Password`
5. Run `py .\db.py --init` to initialize the database
6. Run `py .\app.py` to start the backend
7. Open a seperate terminal at `helix/helix-client`
8. Run `npm i` to install npm libraries
9. Set up `.env.local` file with `DB_USER` and `DB_PASSWORD`
10. Run `npm run dev` to start the client
11. Go to `http://localhost:3000/`
