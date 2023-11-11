FROM denoland/deno

EXPOSE 3000
WORKDIR /server
COPY . .

CMD ["deno", "task", "start"]
