# Как выложить сайт OZOD ELECTRIC в интернет

Пошагово, без лишнего. Итог: сайт на вашем домене, с HTTPS, админкой и защитой.

---

## 1. Что купить

| Что | Где (Узбекистан) | Примерно |
| --- | --- | --- |
| **Домен** `.uz` | ahost.uz, uzinfocom (cctld.uz), webname.uz | ~100–150 тыс. сум/год |
| или домен `.com` | Namecheap, Cloudflare Registrar | ~$10/год |
| **VPS-сервер** (Ubuntu 24.04, 1–2 ГБ RAM, 20 ГБ SSD) | ahost.uz, Timeweb Cloud, Hetzner, DigitalOcean | $4–8/мес |

> Нужен именно **VPS**, а не обычный «PHP-хостинг»: сайт работает на Node.js и хранит заявки и фото в папке `data/`.
> Vercel и Netlify не подойдут как есть: они не сохраняют файлы между запусками.

---

## 2. Домен → сервер

В панели регистратора домена откройте **DNS** и добавьте:

```
Тип  Имя   Значение
A    @     IP_ВАШЕГО_СЕРВЕРА
A    www   IP_ВАШЕГО_СЕРВЕРА
```

DNS обновляется от 15 минут до 24 часов.

**Рекомендую Cloudflare (бесплатно):** зарегистрируйтесь на cloudflare.com → «Add site» → у регистратора замените NS-серверы на те, что выдаст Cloudflare → DNS-записи добавляйте уже в Cloudflare (оранжевое облако включено). Это даёт защиту от DDoS, кэш и скрывает IP сервера.

---

## 3. Подготовка сервера (один раз)

Подключитесь к серверу с компьютера (IP и пароль присылает хостинг):

```bash
ssh root@IP_ВАШЕГО_СЕРВЕРА
```

Дальше всё выполняется на сервере:

```bash
# обновления и базовые программы
apt update && apt upgrade -y
apt install -y nginx git ufw fail2ban unattended-upgrades

# Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
npm install -g pm2

# отдельный пользователь для сайта (не запускаем сайт от root)
adduser --disabled-password --gecos "" ozod
```

### Файрвол — открыты только SSH и веб

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

### Автообновления безопасности

```bash
dpkg-reconfigure -plow unattended-upgrades   # ответить «Yes»
```

---

## 4. Загрузка сайта

**Вариант А — через GitHub (удобно обновлять).** Загрузите проект в приватный репозиторий, затем на сервере:

```bash
su - ozod
git clone https://github.com/ВАШ_ЛОГИН/ozod-electric.git site
cd site
```

**Вариант Б — без GitHub.** С вашего компьютера (папку `node_modules` и `.next` не копируйте):

```bash
scp -r "ozod electric" root@IP:/home/ozod/site
ssh root@IP "chown -R ozod:ozod /home/ozod/site"
```

### Настройки (.env.local)

```bash
cd ~/site
cp .env.example .env.local
nano .env.local
```

Заполните:

```
TELEGRAM_BOT_TOKEN=токен_от_BotFather
TELEGRAM_CHAT_ID=id_чата
ADMIN_PASSWORD=длинный-сложный-пароль-16+символов
ADMIN_SECRET=вставьте_результат_команды_ниже
```

Сгенерировать `ADMIN_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Закрыть доступ к файлу посторонним:

```bash
chmod 600 .env.local
```

### Сборка и запуск

```bash
npm ci
npm run build
pm2 start npm --name ozod -- start -- -p 3000 -H 127.0.0.1
pm2 save
exit                                   # обратно в root
env PATH=$PATH:/usr/bin pm2 startup systemd -u ozod --hp /home/ozod
```

`-H 127.0.0.1` — сайт слушает только внутри сервера, снаружи к нему ходят через Nginx.

---

## 5. Nginx + бесплатный HTTPS

Создайте файл `/etc/nginx/sites-available/ozod` (замените `ozod-electric.uz` на свой домен):

```nginx
server {
    listen 80;
    server_name ozod-electric.uz www.ozod-electric.uz;

    client_max_body_size 25m;          # загрузка фото в админке
    server_tokens off;

    # ограничение частоты запросов к API
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://127.0.0.1:3000;
        include /etc/nginx/proxy_params;
        proxy_set_header X-Forwarded-Host $host;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        include /etc/nginx/proxy_params;
        proxy_set_header X-Forwarded-Host $host;
    }
}
```

В `/etc/nginx/nginx.conf` внутри блока `http { ... }` добавьте строку:

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
```

Включить и проверить:

```bash
ln -s /etc/nginx/sites-available/ozod /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

HTTPS-сертификат Let's Encrypt (бесплатный, продлевается сам):

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d ozod-electric.uz -d www.ozod-electric.uz --redirect
```

Если используете Cloudflare — в его панели поставьте **SSL/TLS → Full (strict)**, и чтобы лимиты считались по реальному IP посетителя (а не по IP Cloudflare), создайте `/etc/nginx/conf.d/cloudflare.conf`:

```nginx
# актуальный список: https://www.cloudflare.com/ips/
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 108.162.192.0/18;
set_real_ip_from 190.93.240.0/20;
set_real_ip_from 188.114.96.0/20;
set_real_ip_from 197.234.240.0/22;
set_real_ip_from 198.41.128.0/17;
set_real_ip_from 162.158.0.0/15;
set_real_ip_from 104.16.0.0/13;
set_real_ip_from 104.24.0.0/14;
set_real_ip_from 172.64.0.0/13;
set_real_ip_from 131.0.72.0/22;
real_ip_header CF-Connecting-IP;
```

и выполните `nginx -t && systemctl reload nginx`.

Готово: сайт открывается по `https://ваш-домен`.

В `src/config/site.ts` поменяйте `url` на свой домен — это нужно для SEO и sitemap.

---

## 6. Админ-панель

- Адрес: `https://ваш-домен/admin`
- Пароль — `ADMIN_PASSWORD` из `.env.local`.
- Сменить пароль: отредактируйте `.env.local` и выполните `pm2 restart ozod`. Все старые входы останутся рабочими, пока не смените и `ADMIN_SECRET` — смените оба, если пароль утёк.
- После 8 неверных попыток вход блокируется на 15 минут для этого IP.

---

## 7. Защита — что уже сделано и что сделать вам

**Уже встроено в сайт**
- HTTPS-only заголовки (HSTS), запрет встраивать сайт во фреймы, строгая Content-Security-Policy.
- Вход в админку: пароль сверяется без утечки по времени, сессия — подписанная httpOnly-cookie (JavaScript её не видит), SameSite=Strict + проверка Origin против CSRF.
- Защита от перебора пароля и спама заявок (лимиты по IP, скрытое поле-ловушка для ботов).
- Загрузка фото: тип проверяется по содержимому файла, имена генерируются случайно — залить скрипт вместо картинки нельзя.
- Сумма в заявке пересчитывается на сервере — подделать цену из браузера нельзя.
- `/admin` и `/api` закрыты от поисковиков.

**Сделайте на сервере**
1. **SSH по ключу, без пароля.** На своём компьютере: `ssh-keygen`, затем `ssh-copy-id root@IP`. После проверки входа по ключу в `/etc/ssh/sshd_config` поставьте `PasswordAuthentication no` и `PermitRootLogin prohibit-password`, затем `systemctl restart ssh`.
2. **fail2ban** уже установлен — он банит IP после неудачных попыток входа по SSH.
3. **Длинный пароль админки** (16+ символов) и никому не пересылайте `.env.local`.
4. **Резервные копии** заявок и фото — раз в день:
   ```bash
   crontab -e -u ozod
   # добавить строку:
   0 3 * * * tar czf /home/ozod/backup-$(date +\%F).tgz -C /home/ozod/site data && find /home/ozod -name 'backup-*.tgz' -mtime +14 -delete
   ```
5. **Обновления зависимостей** раз в месяц: `npm audit` и `npm update`, затем пересборка (раздел 8).

---

## 8. Как обновлять сайт

```bash
ssh root@IP
su - ozod
cd site
git pull            # или заново скопируйте файлы через scp
npm ci
npm run build
pm2 restart ozod
```

Папка `data/` (заявки, фото, цены) при обновлении не трогается.

---

## 9. Если что-то не работает

| Проблема | Что проверить |
| --- | --- |
| Сайт не открывается | `pm2 status`, `pm2 logs ozod`, `systemctl status nginx` |
| 502 Bad Gateway | сайт не запущен: `pm2 restart ozod` |
| Заявки не приходят в Telegram | токен и chat id в `.env.local`; бот добавлен в группу; `pm2 logs ozod` |
| Не грузятся фото в админке | `client_max_body_size` в Nginx |
| Домен не открывается | DNS ещё обновляется, проверьте на dnschecker.org |
