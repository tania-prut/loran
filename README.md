# LORAN
Емулятор вимірювальної частини LORAN надається у вигляді Docker image під назвою iperekrestov/university/loran-emulation-service. Щоб запустити емулятор, виконайте наступні кроки:  
1. Завантажте Docker image з Docker Hub:  
docker pull iperekrestov/university:loran-emulation-service  
2. Запустіть Docker контейнер, використовуючи наступну команду:  
docker run --name loran-emulator -p 4002:4000 iperekrestov/university:loran-emulation-service  
Для зчитування даних з емулятора необхідно підключитися до нього через WebSocket:  
wscat -c ws://localhost:4002 <br><br>
![1](screenshots/1.jpg)

Веб-додаток підключається до WebSocket сервера та зчитує дані про часи отримання сигналів базовими станціями. Обробляє дані отримані через вебсокет і відображає положення об'єкта і базових станцій на графіку.<br><br>

1. Підключення до WebSocket сервера<br>
![2](screenshots/2.jpg)
2. Обробка даних<br>
![3](screenshots/3.jpg)
3. Розрахунок позиції об'єкта<br>
![4](screenshots/4.jpg)
4. Відображення даних на графіку<br>
![5](screenshots/5.jpg)
<br>
5. Можливість зміни параметрів вимірювальної частини радара за допомогою API запитів. <br>
![6](screenshots/6.jpg)
