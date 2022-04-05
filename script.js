// BANKIST APP
const cargasPagina = window.localStorage.getItem('cargasPagina') || 0;
window.localStorage.setItem('cargasPagina', Number(cargasPagina) + 1);
/* MONGODB
db.getCollection('cuentas').find({})
mongoimport --db bancos --collection cuentas --drop --file cuentas.json --jsonArray
db.getCollection('cuentas').insertMany([
 {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
},
{
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
},
{
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
},
const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
}
])
*/
// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};
const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};
const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};
const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};
const accounts = [account1, account2, account3, account4];
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');
const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');
const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');
const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// global variables
let currentAccount;
let timer;
let sortOrder = 'afterbegin';

const displayMovements = function (movements) {
  containerMovements.innerHTML = '';
  movements.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">
          ${i + 1} ${type}
        </div>
        <div class="movements__value">${mov}€</div>
      </div>
    `;
    containerMovements.innerHTML += html;
    containerMovements.insertAdjacentHTML(sortOrder, html); //criterio de ordenacion afterbegin // beforeend
  });
};
/* función que inserta un campo nuevo en lo  accounts, llamado username que tenga las iniciales
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  username: js
};


*/

const logout = function () {
  labelWelcome.textContent = 'Login in to get started';
  containerApp.style.opacity = 0;
  clearInterval(timer);
};

const createUserNames = function (accounts) {
  accounts.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(palabra => palabra[0])
      .join('');
  });
};
createUserNames(accounts);
function displayBalance(acc) {
  acc.balance = acc.movements.reduce((acc, curval) => acc + curval, 0);
  labelBalance.textContent = `${acc.balance}€`;
}
function displaySummary(acc) {
  // la  destructuración  también podría ir en los argumentos de la función
  const { movements, interestRate } = acc;
  // calcular y mostrar depósitos
  const incomes = movements
    .filter(mov => mov > 0)
    .reduce((acc, cur, i, arr) => acc + cur, 0);
  labelSumIn.textContent = `${incomes}€`;
  // calcular  y mostrar retiradas de dinero
  const outcomes = movements
    .filter(mov => mov < 0)
    .reduce((acc, cur, i, arr) => acc + cur, 0);
  labelSumOut.textContent = `${Math.abs(outcomes)}€`;
  // calcular y mostrar intereses
  // versión simplificada: por cada depósito calcular su interés (según dato del account) y por un año
  // independiente de retiradas de dinero.
  // Para que el interes sea tenido en cuenta, tiene que ser superior a 1€ (cada depósito)
  // const interest = (incomes * acc.interestRate) / 100;
  const interest = movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * interestRate) / 100)
    .filter(interest => interest > 1)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumInterest.textContent = `${interest}€`;
}
const updateUI = function () {
  if (timer) clearInterval(timer);
  timer = startLogOutTimer();
  displayMovements(currentAccount.movements);
  displayBalance(currentAccount);
  displaySummary(currentAccount);
};

// EVENTOS ********************************************
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  /* obtener  la cuenta que nos interesa */
  const username = inputLoginUsername.value;
  const pin = Number(inputLoginPin.value);
  currentAccount = accounts.find(acc => acc.username === username);
  if (currentAccount?.pin === pin) {
    labelWelcome.textContent = `Bienvenido ${
      currentAccount.owner.split(' ')[0]
    }`;
    updateUI();
    containerApp.style.opacity = 1;
    inputLoginUsername.value = inputLoginPin.value = '';
    // quitar foco si lo tiene:
    inputLoginPin.blur();
  } else {
    console.log('pin incorrecto  o usuario desconocido');
  }
});
btnTransfer.addEventListener('click', function (e) {
  console.log('hacer  transferencia');
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const transferUsername = inputTransferTo.value;
  const transferAccount = accounts.find(
    acc => acc.username === transferUsername
  );
  // conditions to  transfer
  // positive amount
  // existent user
  // balance >= amount
  // transferAccount !== currentAccount
  if (
    amount > 0 &&
    transferAccount &&
    currentAccount.balance >= amount &&
    transferAccount.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    transferAccount.movements.push(amount);
    updateUI();
  } else {
    console.log('Transferencia no realizada!!!!');
  }
});
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  console.log(
    `cerrar cuenta de ${currentAccount.username} con pin ${currentAccount.pin} `
  );
  const username = inputCloseUsername.value;
  const pin = Number(inputClosePin.value);
  if (username === currentAccount.username && pin === currentAccount.pin) {
    const index = accounts.findIndex(acc => acc.username === username);
    console.log(`Elemento  a eliminar  ${index}`, accounts[index]);
    /* borrar elemento  de accounts */
    // slice no muta el array (accounts) y splice si
    accounts.splice(index, 1);
    console.log(accounts);
    inputCloseUsername.value = inputClosePin.value = '';
    containerApp.style.opacity = 0;
  } else {
    console.log('No se puede eliminar cuenta');
  }
});
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  /* amount>0 and amount*0.1 <  someDeposit */
  const minDepositReq = currentAccount.movements.some(
    mov => mov > amount * 0.1
  );
  if (amount > 0 && minDepositReq) {
    console.log(`Se ha  hecho el depósito de ${amount}`);
    currentAccount.movements.push(amount);
    updateUI();
  } else {
    console.log('No se ha podido hacer el depósito');
  }
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});
//ordenar sort de menor a mayor de fecha

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  sortOrder = sortOrder === 'afterbegin' ? 'beforeend' : 'afterbegin';
  updateUI();
});

/* temporal login */
// currentAccount = account2;
// updateUI();
// containerApp.style.opacity = 1;
// console.log(currentAccount.movements);
//  método some y método  every
const movimientos = [300, -200, -200];
const isDeposit = mov => mov > 0;
const anyDeposit = movimientos.some(isDeposit);
console.log(anyDeposit);
const allDeposit = movimientos.every(isDeposit);
console.log(allDeposit);
const arr = [[1, 3, [5, 7]], [9, 10], 3];
console.log(arr.flat(2));
console.log(arr);
const overallBalance = accounts
  .map(acc => acc.movements)
  .flat()
  .reduce((acc, cur) => acc + cur, 0);
const overallBalance2 = accounts
  .map(acc => acc.movements) // cur -> array(4), arrray(3), array(3)
  .reduce((acc, cur) => acc + cur.reduce((acc, cur) => acc + cur, 0), 0);
const overallBalance3 = accounts
  .flatMap(acc => acc.movements)
  .reduce((acc, cur) => acc + cur, 0);
console.log(overallBalance);
console.log(overallBalance3);
// setInterval -> Asincrona y que no se para (o la  paramos nosotros)
// let i = 0;
// setInterval(() => {
//   i += 1;
//   console.log(i);
// }, 1000);
// let time = 10;
// const startLogOutTimer = function () {
//   const timer = setInterval(() => {
//     time -= 1;
//     if (time === 0) clearInterval(timer);
//     labelTimer.textContent = time;
//   }, 1000);
// };
// startLogOutTimer();
function startLogOutTimer() {
  let time = 300;
  const printTime = time => {
    //  min, sec -> darle un  padding: si tengo 2m y 5s -> 02:05
    const min = Math.trunc(time / 60)
      .toString()
      .padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;
  };
  const tick = () => {
    time -= 1;
    if (time === 0) logout();
    // eliminar timer y cerrar app (opacity = 0) y quitar label de bienvenida
    clearInterval(timer);
  };

  const timer = setInterval(tick, 1000);
  printTime(time);
  return timer;
}

//filter vs find
//el filtro se puede hacer filter o con find
//  - filter opera sobre todo el array
//  -devuelve otro array con los elementos que satisface la funcion (true)
// - Find: Opera sobre parte o todo el array y devuelve el primer elemento que cumple la condicion

// const boletos=[2,4,5,7,8];
// const boletoPremiado=7;
// const ResultadoFind=boletos.find(boleto=>boleto === boletoPremiado);
// console.log(ResultadoFind);

//con find
const FirstWidthdrawal = account1.movements.find(mov => mov < 0);
console.log(FirstWidthdrawal); //visualiza la primera vez que saca dinero en efectivo

//con filter
const FirstWidthdrawal2 = account1.movements.filter(mov => mov < 0)[0]; //aqui hay que especificar el primer array [0]
console.log(FirstWidthdrawal2);

//quiero account2 y buscar a usuario acc.owner === 'Jessica Davis'
const currentAcount = accounts.find(acc => acc.owner === 'Jessica Davis');
console.log(currentAcount);

//pruebas

//inmutabilidad. Los metodos son inmutables o mutables
//las variables tmbn son inmutables o mutables

//array edad y ordenar. tenemos metodos que llaman a funciones

// const edades = [3, 9, 2, 10, 8, 4];
// // const funcionOrdenacion = function (a, b) {
// //   return a - b;
// // };

// const funcionOrdenacion = (a, b) => {
//   // seria lo mismo que const funcionOrdenacion=(a,b)=>a-b;
//   return a - b;
// };
// const edadesOrdenadas = edades.sort(funcionOrdenacion).sort((a, b) => b - a); //con metodo sort ordena el array, se pueden concatenar varios metodos
// //con .sort((a,b)=>b-a), ordenaria de mayor a menor.
// //El metodo sor no es inmutable, llama a la funcion pero lo modifica. Lo mejor es que los metodos sean inmutables, sino cambian los valores de array

// console.log(edadesOrdenadas);
// console.log(edades);

// const estudiante = { nombre: 'pepe', edad: 17 };
// //estudiante = { nombre: 'juan' };// como no apunta en memoria, hay que llamar a estudiante.nombre
// estudiante.nombre = 'juanda';
