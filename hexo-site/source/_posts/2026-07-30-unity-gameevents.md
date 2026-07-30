---
title: Unity 学习笔记（一）：事件系统重构——打造 GameEvents 事件中心
excerpt: 从耦合问题出发理解发布-订阅模式，用 delegate/Action/event 三层实现搭建全局事件中心，附 10 个真实踩坑记录。
categories:
  - 学习笔记
tags:
  - Unity
  - C#
toc: true
abbrlink: 34095
date: 2026-07-30 12:00:00
updated: 2026-07-30 12:00:00
---
> 课程对应：3D 台球 Demo 阶段 1.2 / Task 11，完成日期 2026-07-29
>
> 成果：新建 `Assets/Scripts/GameEvents.cs`，把原先分散在 4 个脚本里的 11 个 static 事件，集中为 10 个事件（含 1 次死代码裁员），全项目 5 个脚本完成解耦，实机验证行为不变。

## 一、核心理论

### 1.1 为什么需要事件？——从"耦合"这个问题说起

场景：蓄力时右侧力度条要跟着涨。

最直白的写法是球杆直接调用 UI：

```text
球杆脚本：蓄力变化了 → uiManager.更新力度条(当前力度)
```

问题在于**球杆必须"认识"UIManager**（要持有它的引用）。这就像把两台电器焊死在一起：

- 删掉 UIManager，球杆脚本立刻编译报错；
- 音效系统也想在蓄力时播声音？球杆还得再认识一个 AudioManager，越焊越多。

这种"你中有我"的关系叫**耦合（Coupling）**。耦合越重，代码越难改。

### 1.2 解决方案：发布-订阅模式

换个思路：球杆不打电话给任何人，只**对空气大喊**"我的力度变成 0.7 了"。谁关心谁自己竖起耳朵听。

- 球杆 = **发布者（Publisher）**，只管广播；
- UIManager = **订阅者（Subscriber）**，只管收听；
- 发布者根本不知道有没有人在听、有几个人在听。

**生活类比：小区广播站。** 广播站播"今晚停水"，不需要挨家挨户敲门；住户想听就去登记，不想听就取消登记。广播站和住户互相不认识。

### 1.3 C# 的三层实现

#### 第一层：委托（delegate）——能存"方法"的变量

普通变量存数据：`int score = 5;`，委托变量存的是**一个方法**。

**类比：电视遥控器的按钮。** 按钮本身不会换台，它只是"绑定"了换台这个动作，而且可以重新绑定成调音量。

委托最关键的能力：用 `+=` 可以**绑定多个方法**，触发一次，绑上去的方法**全部依次执行**——这就是"广播给所有听众"的底层原理。

#### 第二层：Action——系统预制好的委托

早期 C# 定义委托要自己声明类型，很啰嗦。微软把常用形状预制好了，就是 `Action`：

| 写法 | 含义 |
| --- | --- |
| `Action` | 无参数、无返回值 |
| `Action<float>` | 1 个 float 参数 |
| `Action<Ball, Ball>` | 2 个同类型参数 |
| `Action<Player, string>` | 2 个不同类型参数 |

- 尖括号 `<>` 里填的是"**这次广播携带什么数据**"；
- 最多支持 16 个参数；
- **重要**：`Action` 和 `Action<float>` 是**完全不同的类型**，之间没有继承关系，就像"矿泉水瓶"和"带隔层的饭盒"是两种容器。签名写错（多写/少写/顺序错），订阅处立刻报错。

#### 第三层：event 关键字——给委托上"安全锁"

光用委托变量有两个安全漏洞：

1. 外部可以用 `=` **直接覆盖**它 → 相当于某住户把广播站的登记簿撕了换成只有他自己；
2. 外部可以**直接触发广播** → 相当于住户冲进广播站抢话筒乱喊。

加上 `event` 关键字后，这两个漏洞被堵住：

> **外部只能 `+=`（登记收听）和 `-=`（取消收听）；只有定义事件的那个类自己，才能触发广播。**

完整拆解一行事件声明：

```csharp
public static event Action<float> OnPowerChanged;
```

| 词 | 含义 |
| --- | --- |
| `public` | 谁都能来订阅 |
| `static` | 属于类本身，不属于某个具体对象 |
| `event` | 安全锁：外部只能 +=/-= |
| `Action<float>` | 广播携带一个 float 数据 |
| `OnPowerChanged` | 事件名，习惯以 `On` 开头 |

### 1.4 static 是什么

- 普通字段属于**每个对象实例**：16 颗球，每颗球的 `ballNumber` 各自独立；
- `static` 字段属于**类本身**，全局只有一份。

**类比**：`ballNumber` 是每个学生自己的学号；`static` 成员像"教室门口的公告栏"，不属于任何一个学生，全班共用一个。

事件加 static 的好处：订阅者不需要先"找到球杆对象"，直接写 `GameEvents.OnPowerChanged += ...` 即可，像直接去公告栏看，不用先找到某个人。

### 1.5 怎么发出广播：`?.Invoke`

```csharp
OnPowerChanged?.Invoke(currentPower);
```

- `Invoke(参数)` = 触发广播，所有登记过的方法依次执行；
- `?.` 是 **null 条件运算符**：如果左边不是 null 才执行右边。

**为什么必须加 `?`**：一个听众都没有时，事件的值是 `null`，直接 `.Invoke()` 会抛 `NullReferenceException`——对着没通电的喇叭喊话，喇叭会炸。加 `?.` 就是先看一眼"有没有人登记"，没人就安静地什么都不做。

### 1.6 头号大坑：取消订阅与内存泄漏

> **static 事件会"抓住"所有订阅者不放。**

当 UIManager 执行 `GameEvents.OnPowerChanged += HandlePowerChanged` 时，这个 static 事件内部就存了一根**指向 UIManager 对象的引用**。

后果链条：

1. 场景重载，旧的 UIManager 物体被销毁；
2. 但 static 事件还攥着它的引用；
3. GC（垃圾回收器，负责清理没人用的内存的系统）认为"还有人需要它"→ **旧对象永远无法释放**，这叫**内存泄漏**；
4. 更糟的是，事件触发时还会去调用"已销毁物体"上的方法，产生诡异报错。

**铁律：`+=` 和 `-=` 必须成对出现。** Unity 里的标准写法是 `OnEnable` 里订阅、`OnDisable` 里取消订阅。

## 二、为什么要做这次重构（改造前后对比）

### 2.1 改造前的状况

项目本来就在用发布-订阅（已有 11 个 static 事件），能跑，但事件**分散在 4 个脚本**里：

| 脚本 | 定义的事件 |
| --- | --- |
| Ball.cs | OnBallPocketed、OnBallHitBall、OnBallHitCushion、OnBallOffTable |
| GameManager.cs | OnGameStateChanged、OnPlayerChanged、OnGameOver、OnScoreChanged |
| CueController.cs | OnPowerChanged、OnShot |
| PocketDetector.cs | OnPocketProcessed |

三个问题：

1. **找事件要翻 4 个文件**。以后想加音效系统订阅"碰库"，得先记住这个事件定义在 Ball 而不是 PocketDetector 里。事件越多越是灾难。
2. **订阅者依然"认识"发布者**。UIManager 里写着 `CueController.OnPowerChanged += ...`，说明 UI 还知道"球杆"这个类的存在，耦合没断干净。
3. **不利于后续接 xLua**（阶段 1.3）。Lua 想监听游戏事件，得给 4 个脚本分别拉线。

### 2.2 改造后的状况

新建 `GameEvents.cs`，成为全游戏唯一的"广播总站"：

- 所有事件**一个文件看全**，配套 Raise 方法成对排列；
- 订阅者只认识 `GameEvents` 一个类。**现在的 UIManager 完全不知道"力度"这个数据来自球杆**；
- xLua 接入时只需桥接 GameEvents 一处；
- 顺手清掉 1 个死代码事件，代码变少了。

### 2.3 搬家的标准三步法（本课最重要的操作范式）

对每一个事件重复以下三步，**一次只搬一个，编译通过再搬下一个**：

```text
第1步：GameEvents 里建"事件 + Raise 触发方法"一对
       （事件签名必须与原版完全一致）
第2步：发布者里删掉旧事件声明，把原来 Invoke 的地方改成调用 GameEvents.RaiseXxx(...)
第3步：所有订阅者的 += / -= 来源，从原发布者类改成 GameEvents
```

**为什么必须有 Raise 触发方法？** 因为 event 的安全锁规定"只有定义事件的类能 Invoke"。事件搬进 GameEvents 后，CueController 就成了"外人"，不能直接 Invoke。所以 GameEvents 必须提供公开方法当作"安装在广播站墙外的合法门铃"：外人按门铃，站内工作人员（方法内的 `?.Invoke`）替他广播。

命名约定：

- `On...` 开头 = 事件（给订阅者用）
- `Raise...` 开头 = 触发方法（给发布者用）

### 2.4 定位改动点的三种方法

代码上千行时靠翻是找不到的，必须会这三招：

1. **全局搜索（最常用）**：`Ctrl + Shift + F` 搜事件名，搜整个项目所有文件。搜索结果就是搬家清单：声明处（要删）、Invoke 处（改 Raise）、+=/-= 处（换台）一目了然。单文件内搜是 `Ctrl + F`。
2. **让编译器指路**：先删掉旧声明 → 保存 → Console 里每条红色报错就是一个"还没换线"的位置，点报错可直接跳转。**报错清单 = 待办清单。**
3. **Find All References**：右键成员名 → 查找所有引用。比文本搜索聪明，不会把注释里同名的词算进来。

### 2.5 一次代码裁员：死代码（Dead Code）

搬家时发现 `OnBallPocketed` **有发布者、零订阅者**——广播天天喊，没有一台收音机开着。这就是**死代码**。

决策：**删除，不搬。** 理由：

1. **死代码有维护成本**：每个读代码的人都会花时间琢磨"这事件谁在听"，最后发现答案是"没人"，白花时间。
2. **它是"残留"不是"预留"**：进度 UI 曾靠进袋事件驱动，后来因事件顺序竞争问题改成了 `OnScoreChanged` 驱动，它从那时起就失业了。是重构后忘扫的尾巴，不是为未来设计的接口。
3. **符合项目传统**：此前专门做过一轮冗余代码清理（删 Test.cs、精简 GameConstants）。
4. **有 Git 兜底**："怕以后要用"从来不是保留死代码的理由——**Git 记得一切**。

专业删除的三步：

1. 全局搜索确认零引用；
2. 删干净不留尸块：声明 + 它的 XML 注释 + Invoke 语句 + **描述这次广播的普通注释**（广播没了注释还在，就成了"说谎的注释"，比没注释更害人）；
3. 编译验证。

### 2.6 事件参数的设计原则

> **订阅者需要什么才带什么，一个都不多带。**

例：碰库事件只带"碰库的球"，不带"碰的哪个库"。因为订阅者 GameManager 拿它只为判定"击球后无落袋且无碰库"犯规，规则根本不关心碰的是东库还是西库。

多余的参数 = 多余的耦合。假如哪天库边物体重做了，带库边参数的事件全得跟着改。

### 2.7 重构的定义（贯穿全课的原则）

> **重构 = 改变代码的结构，不改变代码的行为。**

推论：搬家时事件的"形状"（参数签名）必须**原样照搬**，因为订阅者的 Handle 方法是按原形状写的，改了形状等于给全家换门锁。

**搬家守则：动手前先把原版声明复制过来再改归属，绝不凭记忆重写签名。**

## 三、关键语法速查

### 3.1 事件三件套

```csharp
// 声明事件（在 GameEvents 里）
public static event Action<float> OnPowerChanged;

// 触发方法（给外部发布者用）
public static void RaisePowerChanged(float power) { OnPowerChanged?.Invoke(power); }

// 订阅 / 取消订阅（在订阅者里）
GameEvents.OnPowerChanged += HandlePowerChanged;   // OnEnable
GameEvents.OnPowerChanged -= HandlePowerChanged;   // OnDisable
```

### 3.2 访问修饰符

| 修饰符 | 含义 |
| --- | --- |
| `public` | 谁都能访问 |
| `private` | 只有本类能访问 |
| `internal` | 同一程序集（Assembly，可理解为编译后的同一个 DLL）内可见 |

**类不写修饰符时默认是 `internal`**，不是 public。项目里所有脚本编译进同一程序集，所以不写也能跑；但意图应该写明白——`public static class` 一眼就能读出"全局公开的静态工具类"。**代码不仅是给编译器看的，更是给人看的。**

### 3.3 static class 的特性

- 不能被 `new` 出来；
- 编译器强制其所有成员都是 static；
- 不继承 MonoBehaviour，不挂场景——因为它不需要 Update/Start 等生命周期方法，也不需要出现在场景里。

### 3.4 `using` 命名空间

- `Action` 住在 `System` 命名空间（namespace = 类型的"户籍地址"）；
- 文件顶部写 `using System;` 后，本文件内即可直呼 `Action`；
- 不写就得每处写全名 `System.Action<float>`；
- **`using` 的作用范围是当前这一个文件**，不影响别的脚本。

### 3.5 `this` 关键字

指"我自己（当前这个实例）"。

Ball 挂在 16 颗球上，有 16 个实例。3 号球撞 8 号球时，是"3 号球这个实例"在执行代码，此时 `this` 就指 3 号球。它在广播里喊的是："**我**（this）撞到了那家伙（otherBall）！"

### 3.6 C# 结构规则：声明 vs 语句

> **类的身体里只能放"声明"**（字段、属性、事件、方法……相当于一张成员名单）；**"执行语句"只能住在方法的大括号内部。**

**类比**：类的身体是**教室花名册**，只能登记"有哪些人"；"张三去擦黑板"这种动作指令只能写在课程安排（方法）里。写在花名册上，点名老师（编译器）会当场懵。

### 3.7 大括号后要不要分号

看它整体是不是"赋值语句"：

- 要分号：`int[] a = {1, 2};`
- 不要分号：方法的 `}`、类的 `}`

### 3.8 顶层类型 vs 嵌套类型

- **顶层类型**（声明在类外面）：全项目直呼其名，如本项目的 `GameState`、`Player` 枚举；
- **嵌套类型**（声明在某个类内部）：需要写 `外壳类.类型名`。

## 四、我踩过的坑（本课真实记录，共 10 个）

### 坑1：忘写 `using System;` → CS0246

写了 `Action<float>` 但文件顶部没有 `using System;`。

> **报错**：`CS0246: The type or namespace name 'Action' could not be found`
> **教训**：`Action` 住在 System 命名空间。11 个事件都要用，所以在文件顶部写一次 `using System;` 最省事。

### 坑2：触发方法命名与事件混淆

一开始事件叫 `OnPowerChanged`，触发方法叫 `PowerChanged`，只差一个 On。

> **教训**：三个月后自己都分不清哪个是"广播"、哪个是"按下广播按钮的手"。统一用 `Raise` 前缀（`RaisePowerChanged`）。

### 坑3：方法大括号后多写了分号

写成 `public static void RaisePowerChanged(float power) { ... };`

> **教训**：分号是"语句"的结束符，方法声明不是语句。有的编译器容忍，但不该写。

### 坑4：类忘了写 `public`

写成 `static class GameEvents`，默认变成 `internal`。

> **教训**：当前项目能跑，但一个立志"全项目可见"的广播总站应该把意图写明白。

### 坑5：把执行语句放进了类的声明区 → CS1519 / CS1001

删掉旧事件声明后，把 `OnPowerChanged?.Invoke(currentPower);` 这句**孤零零地留在了类的身体里**（不在任何方法内部）。

> **报错**：`CS1519: Invalid token '.' in class, record, struct, or interface member declaration`（第 133 行第 20 字符）
> **根因**：类里只能放声明，语句只能活在方法体内。
> **顺带学会**：报错括号里的 `(行号, 列号)` 是精确坐标，**看报错先看坐标**。

### 坑6：在类外面直接 Invoke 事件 → CS0070（最有教学价值的一个）

在 CueController 里写了 `GameEvents.OnPowerChanged?.Invoke(currentPower);`。

> **报错**：`CS0070: The event 'GameEvents.OnPowerChanged' can only appear on the left hand side of += or -= (except when used from within the type 'GameEvents')`
> **根因**：这正是 **event 安全锁**在起作用——CueController 想隔着墙直接按 GameEvents 家的广播按钮，Invoke 权限只属于定义事件的类。
> **正解**：调用自己写的 `GameEvents.RaisePowerChanged(currentPower)`。这就是 Raise 触发方法存在的全部意义。
> **附带记忆**：`?.` 判空写在 Raise 方法内部即可，外面不用重复。

### 坑7：脑补签名，发明了不存在的类型 → CS0246

搬碰库/出界事件时，凭事件名字**脑补**"碰库事件应该带上库边"，写成了 `Action<Ball, Cushion>`、`Action<Ball, Table>`。但项目里"库边"只是**打了 Cushion Tag 的普通 GameObject**，根本没有 `Cushion` 类、`Table` 类。

> **报错**：`CS0246: The type or namespace name 'Cushion' could not be found`（和坑1同一个错误码，但原因不同：坑1是"存在但没申报户籍"，这次是"压根不存在"）
> **根因**：违反了"重构不改变行为"的原则——原版是单参数 `Action<Ball>`。
> **教训**：**搬家不是重新设计。** 动手前先复制原版声明再改归属，绝不凭记忆重写签名。
> **附带收获**：理解了原版为什么不带库边参数——订阅者只需要知道"碰库这件事发生过"。

### 坑8：复制粘贴注释忘了改

碰库事件的注释从上面复制下来，还写着"触发**球击**广播"。

> **教训**：复制粘贴注释忘改，是比没有注释更常见的事故源——**说谎的注释比没有注释更害人**。

### 坑9：注释写成了语法教学

在代码里注释"`?.` 是 null 条件运算符，意思是如果左边不是 null 才执行右边"。

> **教训**：语法笔记该写在笔记里（就是本文档），不该留在代码里。熟练后它就是噪音——没人会在代码里注释"+ 是加法"。
> **代码注释应该写用途信息**：这个方法干什么、谁该调用它、参数含义。
> **最终定型的格式**：事件的注释写"何时触发"；Raise 方法的注释写"发布者 / 订阅者 / 参数含义"。

### 坑10：参数命名不精确埋下歧义

`RaiseShot` 的参数一开始也叫 `power`。但项目里有两个不同含义的 float：

- `OnPowerChanged` 的参数 = **0~1 的蓄力进度**；
- `OnShot` 的参数 = **实际施加的力度值**（`actualForce`，不是 0~1）。

> **教训**：**参数名和注释是事件最重要的"身份证"。** 改成 `actualForce` 并在注释里把区别钉死。
> 同类问题：注释里笼统写"ball 为击球"有歧义（容易理解成母球），应按语境写"碰库的球 / 出界的球 / 主动撞击方"。

### 番外：找到了隐藏的订阅者

`OnGameStateChanged` 的订阅者除了 UIManager，还有 **CueBallPlacer**（自由球放置）。

> **教训**：**订阅者从来不止一个文件，绝不能凭印象。** 老实用全局搜索或让编译器点名。

## 五、最终成果

`GameEvents.cs` 共 10 个事件 + 10 个 Raise 方法：

| 事件 | 签名 | 发布者 | 订阅者 |
| --- | --- | --- | --- |
| OnPowerChanged | `Action<float>` | CueController | UIManager |
| OnShot | `Action<float>` | CueController | GameManager |
| OnPocketProcessed | `Action<Ball>` | PocketDetector | GameManager |
| OnBallHitBall | `Action<Ball, Ball>` | Ball | GameManager |
| OnBallHitCushion | `Action<Ball>` | Ball | GameManager |
| OnBallOffTable | `Action<Ball>` | Ball | GameManager |
| OnGameStateChanged | `Action<GameState>` | GameManager | UIManager、CueBallPlacer |
| OnPlayerChanged | `Action<Player>` | GameManager | UIManager |
| OnScoreChanged | `Action`（无参） | GameManager | UIManager |
| OnGameOver | `Action<Player, string>` | GameManager | UIManager |

已删除：`OnBallPocketed`（死代码）。

实机验证通过项：蓄力力度条、击球状态切换、进球计分、洗袋犯规+自由球、黑8指示器、结束面板、重新开始，全程 Console 无报错。

## 六、自测问题

1. 为什么 `event` 关键字比裸的委托变量安全？它具体禁止了外部做哪两件事？
2. `OnEnable` 里 `+=` 之后，如果忘了在 `OnDisable` 里 `-=`，会发生什么？请把后果的完整链条说出来。
3. 事件搬进 GameEvents 之后，为什么发布者不能直接 `Invoke`，必须通过 Raise 方法？对应的报错码是多少？
4. `Action`、`Action<float>`、`Action<Ball, Ball>` 三者之间有继承关系吗？签名写错时会在哪一端报错？
5. 判断一个事件是不是"死代码"要看什么？确认后删除时，除了声明和 Invoke，还有什么必须一起删掉？
   答：我们在重构时发现 `OnBallPocketed` 有发布者、零订阅者——广播天天喊，没有一台收音机开着，这就是死代码；对于其他代码而言，粗略地理解成不被使用即没有被任何其他代码引用的，就是死代码。删除时，除了声明和 Invoke，还需要删除相关的注释并且编译确认删除后没有报错。
6. 为什么碰库事件只带"哪颗球"而不带"哪个库边"？用一句设计原则回答。
7. 代码上千行时，定位一个成员的所有改动点有哪三种方法？哪一种能顺便得到"待办清单"？
   答：①全局搜索（最常用）：`Ctrl + Shift + F` 搜事件名，搜整个项目所有文件，搜索结果就是搬家清单。②让编译器指路：先删掉旧声明 → 保存 → Console 里每条红色报错就是一个"还没换线"的位置。报错清单 = 待办清单。③Find All References：右键成员名 → 查找所有引用。比文本搜索聪明，不会把注释里同名的词算进来。
8. 一句话说出"重构"的定义，以及它对搬家时的参数签名意味着什么约束。
   答：重构 = 改变代码的结构，不改变代码的行为。搬家时事件的"形状"（参数签名）必须原样照搬，因为订阅者的 Handle 方法是按原形状写的，改了形状等于给全家换门锁。

## 七、下一课预告

**第2课：泛型对象池 ObjectPool.cs（Task 12）** 关键词：Instantiate/Destroy 的代价、GC 卡顿、泛型 `<T>`、泛型约束 `where T : Component`、`Queue<T>`。

**远期回响**：本课的 GameEvents 是阶段 1.3（xLua 集成）的关键铺垫——Lua 脚本想监听游戏事件，只需对接 GameEvents 这一个总机。
