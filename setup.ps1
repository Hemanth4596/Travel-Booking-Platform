npm init -y
npm i -D concurrently
mkdir server
cd server
npm init -y
npm i express mongoose cors dotenv jsonwebtoken bcrypt zod helmet
npm i -D typescript ts-node nodemon @types/express @types/cors @types/jsonwebtoken @types/bcrypt @types/node
npx tsc --init
cd ..
npm create vite@latest client -- --template react-ts
cd client
npm i
npm i react-router-dom axios lucide-react recharts
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
cd ..
