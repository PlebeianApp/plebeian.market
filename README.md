## Plebeian.market
### WIP!
In this repo we will develop the new plebeian app.

- Roadmap [here](https://github.com/PlebeianTech/plebeian.market/blob/main/docs/roadmap.md) (We will end using github projects to manage the roadmap)
- Graphic assets [(Figma)](https://www.figma.com/design/HBf8PBS0uLCevuzz2DrHWB/Plebeian-Market-Design?node-id=108-223&t=XI0SfKDvVQeC3bc5-1) 



### Localhost installation

Requirements:
- `pnpm`
```
brew install pnpm
```
or
```
pnpm i
```

if does not work, try,
```
npm i pnpm
```

if you get a ECONNREFUSED error, find and edit the file `.npmrc`
```
registry=http://localhost:8883
```
Remove `http://localhost:8883` and save the file. Run again 
pnpm i 

then, to (re)initiate the empty database:
```
 pnpm db:init
```

to load placeholder contents randomly:
```
 pnpm db:setup
```
`^C` to stop the server. Finally start or restart the server
```
pnpm dev
```
By default your Plebeian market will be accessible via browser from `http://localhost:5173/`