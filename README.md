# [Demo](https://syberry.herokuapp.com)

```
- npm install
- bower install
- npm run start
- open http://localhost:3000
```

## Описание задания :
В рамках данной задачи необходимо разработать тестовый проект (новостной блог) со следующими функциями: 

1. Авторизация пользователей с двумя ролями: обычный пользователь и администратор.
2. Обычным пользователям должна быть доступна страница с постраничным просмотром списка новостей.
3. Администраторам должна быть доступна страница с управлением новостями (список новостей, добавление/редактирование/удаление новости).

## Список страниц:

### 1. Главная
a.	На главной странице должен выводиться список новостей, добавленных администратором в базу данных. По клику на текст новости должен осуществляться переход на страницу данной новости.
b.	Если новостей в базе более 10, внизу страницы должны выводиться ссылки для постраничной навигации по новостям.
c.	Новости должны быть отсортированы в порядке, обратном порядку их добавления на сайт.

### 2. Страница новости
a. На странице должен выводиться полный текст новости и изображение, загруженное администратором. Также на странице должна присутствовать ссылка для возврата к списку новостей на главную страницу.
### 3. Страница авторизации
a.	На странице должна выводиться форма авторизации в панели управления для администратора. При отправке неверных данных для входа система должна отображать пользователю соответствующую ошибку.
### 4. Страница управления новостями
a. На странице должен выводиться список новостей (аналогично главной), рядом с каждой новостью должны присутствовать ссылки для ее редактирования и удаления.
b. При попытке удаления новости система должна спрашивать подтверждение у пользователя и удалять новость только при положительном ответе.
c. При нажатии на ссылку редактирования система должна отправлять пользователя на страницу с формой редактирования новости.
d. На странице должна присутствовать ссылка на страницу добавления новости.
### 5. Страница добавления новости
a. На странице должна отображаться форма с полями для создания новости: заголовок, текст, изображение (файл).
b. Система должна проверять корректность загруженного файла и заполненных данных и выводить соответствующие сообщения в случае ошибок.
c. Если все данные введены корректно, система должна добавлять в базу данных новость, загружать изображение на сервер и перенаправлять пользователя на страницу управления новостями с соответствующим сообщением.
d. Если данные введены не корректно, система должна сохранять данные, введенные пользователем при отображении сообщения об ошибке.
e. Если пользователь загрузил файл, но не заполнил текст, система не должна заставлять его грузить файл второй раз (загруженный файл должен быть отображен). При этом у пользователя должна быть возможность заменить или удалить изображение.
### 6. Страница редактирования новости
a. Страница работает аналогично странице создания новости но при ее открытии форма должна быть пред заполнена данными новости (включая загруженное изображение)
b. В случае, если неавторизованный пользователь переходит в панель управления новостями, система должна перенаправлять его на страницу авторизации и выводить соответствующее сообщение.
