lin onetwo, [May 26, 2019 at 8:10:18 PM]:

...要是 Starbound 有那种会一直刷冒险者的传送门就好了

就可以做成地下城守护者那样的塔防游戏

echo 口, [May 26, 2019 at 8:10:55 PM]:

对鸭，不过这样就是另一个游戏了嘛

lin onetwo, [May 26, 2019 at 8:11:28 PM]:

是啊，要怎么融入现在的游戏还很难想

因为这种模式不是强制的，是你要放一个传送门在你的地牢门口

那可以得到什么奖励就得平衡一下

比如杀死前来的冒险者只能得到类似经验球那样的特殊货币，然后在特殊商城里购买特殊的陷阱道具

还有后几波的冒险者都能免疫岩浆之类的伤害，让你必须实打实地用机关、步哨枪来防御他们

echo 口, [May 26, 2019 at 8:16:13 PM]:

那也可以叭，不过新月不喜欢这种要一直防御的，家里还会被破坏

lin onetwo, [May 26, 2019 at 8:16:55 PM]:

那可以到专门的副本地图里去玩

现在 Starbound 的副本大都是敌人呆站着等你，然后场景不可破坏

就是让你只能去冒险

但是玩一玩敌人主动进攻你，然后你可以破坏场景重建场景

那也很有意思嘛

然后敌人会丢炸弹炸开你的防御

lin onetwo, [May 26, 2019 at 8:39:57 PM]:

我觉得要是做一个这样的 mod 去挑战应该还蛮好玩的

然后和朋友一起挑战成功后，奖励的宝箱里放的是荣耀点，可以用来购买更强的基地防御设备、自动炮塔等等，总之就是鼓励你进一步挑战，然后不断升级火力

echo 口, [May 26, 2019 at 8:45:29 PM]:

感觉很像泡泡堂里面的抢包子大战

lin onetwo, [May 26, 2019 at 8:45:32 PM]:

然后炮塔又要花电和弹药，就得花钱和荣誉点去买弹药

然后又得在自己的基地里面生产基础资源来生产弹药

有一点点像吧

那就是敌人会过来抢你这边的东西

echo 口, [May 26, 2019 at 8:47:57 PM]:

这完全是塔防游戏了嘛

然后也可以设置各种陷阱鸭

lin onetwo, [May 26, 2019 at 8:48:28 PM]:

是啊，专用陷阱要用荣誉点来买

那这样就可以一起联机打敌人了

不然就只能我们俩各建一个城堡，pvp 放陷阱来坑对方了

## 如何提升可重玩性

不一次性给完所有奖励，而是用科技树（Zetabound）、荣誉点来解锁。

减少每一局的时间，而允许玩家在完成每一局后快速在同一地图上开始下一局，提升难度和奖励。

## 如果游戏发生在副本里面，怎么保存之前建设的阵地？

[Steam Workshop :: Base In A Box](https://steamcommunity.com/sharedfiles/filedetails/?id=729460427)

要是有一个适合生存模式的轻量版就好了：

[Steam Community :: Discussions](https://steamcommunity.com/workshop/filedetails/discussion/729460427/1617220671495430108/)

好像不是原版代码，都过时了，我可能应该下载 mod 后直接看里面的代码

[seals55/Starbound-Mods](https://github.com/seals55/Starbound-Mods/tree/master/modules-in-a-box)

[seals55/Starbound-Mods](https://github.com/seals55/Starbound-Mods/tree/master/pilch_sciencestation)

## 玩家用砖块堵住了所有前进路径怎么办

让怪物向玩家方向传送，跳过所有阻碍。这将成为设置不可逾越的阻碍的惩罚。

或者让怪物进入愤怒状态然后拆墙，如何用武器拆墙可以看讨论：

[Modding Help What is it that makes the bonehammer destroy terrain?](https://community.playstarbound.com/threads/what-is-it-that-makes-the-bonehammer-destroy-terrain.55347/)

还可以看看 FU 里的 Mining Larser 的定义

### 那如果所有阻碍还有门都可以被跳过，那还需要阵地干嘛？

我想可以划分一块阵地区域，给玩家建设城堡，在阵地区域内敌人不会传送，但是会大量丢炸弹来拆毁建筑物。

阵地区域是在地面上的，只能向上延伸，而且区域大小一开始很小只能通过购买来放大。如果玩家建了一座塔，底下被炸掉了那玩家自然也只能下来。

或者像俄罗斯方块那样，如果建筑的某一层被清空了，就把整个建筑物向下平移。

### 更好的寻路算法

A*可以做平台跳跃寻路的，要是能寻到一条路，就说明玩家没有用砖块堵死路。如果寻不到路就用炸弹或者传送。

[https://www.reddit.com/r/gamedev/comments/1lac4b/how_to_implement_a_pathfinding_in_a_2d_platformer/](https://www.reddit.com/r/gamedev/comments/1lac4b/how_to_implement_a_pathfinding_in_a_2d_platformer/)

[https://www.youtube.com/watch?v=DlkMs4ZHHr8](https://www.youtube.com/watch?v=DlkMs4ZHHr8)

[https://github.com/RobinB/mario-astar-robinbaumgarten](https://github.com/RobinB/mario-astar-robinbaumgarten)