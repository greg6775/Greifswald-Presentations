FROM denoland/deno

EXPOSE 8080
WORKDIR /server
COPY . .

CMD ["deno", "task", "start"]
