FROM node:lts

WORKDIR /app/gp-v2-contracts

RUN git clone --depth 1 --branch main https://github.com/gnosis/gp-v2-contracts . &&\
    yarn && yarn build
ADD entrypoint.sh .

CMD ["./entrypoint.sh"]
