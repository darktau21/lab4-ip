import numpy as np
import matplotlib
import matplotlib.pyplot as plt
import seaborn as sns
import math

"""
Модель Эллиота (обобщенная модель Гилберта)
Последовательность ошибок {Ei} - определяется функцией распределения P(l)
В схеме восстановления предполагаются, что есть хорошие и плохие состояния каналов
В "хорошем"  состоянии вероятность  искажения символов кода Е = 0, а в "плохом" Е>0
В лабораторной работе генерация помеховой обстановка в канале просходит по следующей схеме:
1. Определяется дистанция до очередной помехи по функции распределения F(d)
2. Определяется длительность помехи по функции распределения F(b)
3. Амплитуда помехи определяется по формуле F(a)
4. Полярность помехи - вероятностью Pn(+) положительного напряжения помехи
Если напряжение помехи Uп больше порогового уровня сигнала Uпор, то она внесет искажения
(если имеет разную полярность с сигналом) 
Елси на интервале D ошибок нет, то число неискаженныъ бит NB и длительность интервала
до ошибки L увеличивается на величину D. Затем проверяется условие A<Up - внесет ли помеха искажение?
если ампилтуда помехи меньше уровня порогового напряжения UP, то к величинам
NB и L прибавляется длительность помехи и осуществляется переход к STATIB, в которой величина счетчиека C2(1) увеличивается на единицу
Счетчик накапливает частоту событий, состяощих в том, что на всей длине помехи не было ошибок.
Если  A> Uп, то происходит моделирования процессов налодения помехи на полезный сигнал 
"""
# Кол-во бит
N = 15
# длина кода
code_length = 12
# число искаженных символов
reg = 3
# sigma
sigma = 4

lamb = 1
# напряжение
U = 0.5

Fa = Fb = Fd = np.random.exponential(lamb, N)

# E=0 E>1
e = np.round(np.random.normal(0.4, 0.1, N), 0)
c = np.random.choice([1, 0], N, p=[0.4, 0.6])
print("c", c)
c_mod = np.empty(N)
interference = np.zeros(N)
# ошибка
error_interval = list()
errors_ins_interference = list()

num_good_bits = 0
num_bad_bits = 0

num_good_msgs = 0
num_bad_msgs = 0

errors_ins_msg = list()
# Poш
P_er = list()
# Вероятность стирания при стирании
P_sd = list()
# Вероятность стирания при декодировании
P_nd = list()

print(
    "Uпор\t№ опыта\tКол. Бит\tНеиск. Бит\tИск. Бит\tИск. Сообщ\tНеиск. Сооб\tP(ош)\tP (1 ош. фикс)\tP(ош. Не фикс)\tСред. Ош.\tP(сд)\tP(нд)"
)
# Перебор пороговых значений
for U in [2, 2.5, 3, 3.5, 4]:
    # Два опыта на каждое значение
    for t in [1, 2]:
        num_good_bits = 0
        num_bad_bits = 0
        num_good_msgs = 0
        num_bad_msgs = 0
        x = 0
        y = 0
        # проход по каждому биту сообщений
        while x < N:
            # дистанция до ошибки
            d = np.round(np.random.exponential(lamb, 1), 2)
            # длина ошибки
            b = np.round(np.random.exponential(lamb, 1), 2)
            # полярность напряжения помехи 50%/50%
            p = np.random.choice([1, -1], 1, p=[0.5, 0.5])
            # амплитуда
            a = p * np.random.exponential(lamb, 1)
            # print(a)
            # print("-")

            while (x < y + int(d[0])) and x < N:
                # print(x, y + int(d[0]))
                interference[x] = 0
                x += 1
                # print("...........")

            y = x
            while (y < x + int(b[0])) and y < N:
                # print(y, x + d[0])
                interference[y] = a
                y += 1
                # print("+++++++++++")
            x = y
        # print(interference)

    k = 0
    for x in range(N):
        if e[x] == 0:
            k += 1
        else:
            if k > 0:
                error_interval.append(k)
            k = 0

    n = 0
    for x in range(N):
        if interference[x] != 0:
            if e[x] == 1:
                n += 1
        else:
            if n > 0:
                errors_ins_interference.append(n)
            n = 0
    print(errors_ins_interference)

    for x in range(N):
        if (e[x] > 0) and ((interference[x] > U) or (interference[x] < -U)):
            if (interference[x] > U) and c[x] < 1:
                c_mod[x] = abs(c[x] - 1)
                num_bad_bits += 1
                continue
            elif (interference[x] < U) and c[x] > 1:
                c_mod[x] = abs(c[x] - 1)
                num_bad_bits += 1
                continue
        else:
            c_mod[x] = c[x]
    for x in range(N):
        if (c_mod[x] != 0) and (c_mod[x] != 1):
            c_mod[x] = 0
    num_good_bits = N - num_bad_bits

    for x in range(0, N, code_length):
        if np.array_equal(c[x : x + code_length], c_mod[x : x + code_length]):
            num_good_msgs += 1
        else:
            m = 0
            for k in range(x, x + code_length - 1):
                if c[k] != c_mod[k]:
                    m += 1
            errors_ins_msg.append(m)
    num_bad_msgs = int((N / code_length) - num_good_msgs)
    print("badmsgs", num_bad_msgs)

    P_er.append(round(num_bad_bits / (num_bad_bits + num_good_bits), 3))
    P_er_t = round((P_er[-1] ** (reg)) * (1 - P_er[-1]) ** (code_length - reg), 3)
    P_g_n = round(
        math.factorial(code_length)
        / (math.factorial(code_length - reg) * math.factorial(reg))
        * (P_er[-1] ** (reg))
        * (1 - P_er[-1]) ** (code_length - reg),
        3,
    )
    Err_mean = 0
    for g in range(1, code_length):
        Err_mean += g * (
            math.factorial(code_length)
            / (math.factorial(code_length - g) * math.factorial(reg))
            * (P_er[-1] ** (g))
            * (1 - P_er[-1]) ** (code_length - g)
        )
    Err_mean = round(Err_mean, 3)
    P_sd.append(round(code_length * P_er[-1], 3))
    P_nd.append(
        round(
            math.factorial(code_length)
            / (math.factorial(code_length - reg + 1) * math.factorial(reg + 1))
            * (P_er[-1] ** (reg + 1)),
            7,
        )
    )

    print(
        U,
        "\t",
        t,
        "\t",
        N,
        "\t",
        num_good_bits,
        "\t",
        num_bad_bits,
        "\t",
        num_bad_msgs,
        "\t",
        num_good_msgs,
        "\t",
        P_er[-1],
        "\t",
        P_er_t,
        "\t",
        P_g_n,
        "\t",
        Err_mean,
        "\t",
        P_sd[-1],
        "\t",
        P_nd[-1],
        "\t",
    )


fig = plt.figure(figsize=(15, 9))
ax1 = plt.subplot2grid((5, 1), (0, 0), rowspan=2, colspan=1)
line = plt.bar(
    range(N % 121),
    interference[: len(interference) % 121],
    align="center",
    width=1,
    fill=False,
    edgecolor="b",
    linewidth=2,
)
line2 = plt.plot(range(N % 121), np.full(N % 121, U), color="red")
line3 = plt.plot(range(N % 121), np.full(N % 121, -U), color="red")
ax1.plot()
# ax2 = fig.add_subplot(3,1,2)
ax2 = plt.subplot2grid((5, 1), (2, 0), rowspan=1, colspan=1)
line4 = plt.bar(
    range(N % 121),
    e[: len(e) % 121],
    align="center",
    width=1,
    fill=False,
    edgecolor="k",
    linewidth=2,
)
ax2.plot()
# ax3 = fig.add_subplot(3,1,3)
ax3 = plt.subplot2grid((5, 1), (3, 0), rowspan=1, colspan=1)
line5 = plt.bar(
    range(N % 121),
    c[: len(c) % 121],
    align="center",
    width=1,
    fill=False,
    edgecolor="b",
    linewidth=2,
)
ax3.plot()
ax4 = plt.subplot2grid((5, 1), (4, 0), rowspan=1, colspan=1)
line6 = plt.bar(
    range(N % 121),
    c_mod[: len(c_mod) % 121],
    align="center",
    width=1,
    fill=False,
    edgecolor="g",
    linewidth=2,
)
ax4.plot()
plt.show()
fig = plt.figure(figsize=(9, 7))
n, bins, patches = plt.hist(
    error_interval, 7, density=1, facecolor="blue", alpha=0.9, width=2
)
sns.distplot(error_interval, hist=False, color="k")
plt.show()
fig = plt.figure(figsize=(9, 7))
n, bins, patches = plt.hist(
    errors_ins_interference, 7, density=1, facecolor="blue", alpha=0.9, width=0.2
)
plt.show()
fig = plt.figure(figsize=(9, 7))
n, bins, patches = plt.hist(
    errors_ins_msg, 7, density=1, facecolor="blue", alpha=0.9, width=0.2
)
plt.show()
U = [1, 1, 1.5, 1.5, 2, 2, 2.5, 2.5, 3, 3, 3.5, 3.5, 4, 4]

fig = plt.figure(figsize=(9, 7))
plt.plot(U, P_er[0::2], "-mo")
plt.plot(U, P_er[1::2], "-mo")
plt.show()
fig = plt.figure(figsize=(9, 7))
plt.plot(U, P_sd[0::2], "-mo")
plt.plot(U, P_sd[1::2], "-mo")
plt.show()
fig = plt.figure(figsize=(9, 7))
plt.plot(U, P_nd[0::2], "-mo")
plt.plot(U, P_nd[1::2], "-mo")
plt.show()
