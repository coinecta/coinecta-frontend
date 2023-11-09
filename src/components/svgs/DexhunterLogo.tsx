import React, { FC } from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { SxProps } from "@mui/material";

const XerberusLogo: FC<{ sx?: SxProps }> = ({ sx }) => {
  return (
    <SvgIcon sx={{ fontSize: '120px', ...sx }} width="1805" height="489" viewBox="0 0 1805 489" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M154.215 465.497C154.33 465.842 154.457 466.191 154.604 466.548C154.604 466.548 152.469 466.401 148.957 465.911C143.084 465.092 133.361 463.317 123.324 459.678C122.116 459.24 120.869 458.797 119.583 458.341L119.578 458.339C110.501 455.116 99.4615 451.196 85.9998 443.288L73.0624 477.808H45.6088L33.9457 399.877L33.9698 399.879C33.7585 398.252 33.579 396.635 33.409 395.103L33.3866 394.902C31.7158 392.088 30.1536 389.17 28.709 386.159C28.3579 386.184 28.1107 386.151 28.0745 385.999C27.8849 385.204 27.7148 384.438 27.5548 383.678C13.796 353.16 11.9866 313.745 31.1719 277.28C40.9539 258.687 48.9137 243.407 55.4066 230.153L32.6289 180.911L52.6444 167.881L74.9519 183.103C77.6852 174.181 79.6616 165.44 81.125 155.997C81.5894 153 82.0022 149.932 82.3711 146.765L26.4023 105.074L97.099 15L134.918 43.1713C146.605 49.279 165.145 56.698 193.574 49.1054L284.052 115.144L227.84 184.411C220.608 198.418 214.936 212.08 210.719 225.285C219.386 218.959 228.442 209.475 233.445 196.4C246.108 190.841 279.44 185.777 311.46 209.993C294.64 209.036 265.705 211.873 284.522 230.886C275.379 226.478 255.694 223.462 250.104 246.667C245.046 242.038 229.198 235.322 205.544 244.41C204.732 248.085 204.038 251.718 203.458 255.305C215.44 257.365 232.918 257.413 249.952 249.222C263.384 253.002 291.577 269.956 296.879 307.528C285.285 296.402 261.98 280.545 261.517 306.125C258.124 297.231 245.973 282.823 224.504 296.344C224.296 290.621 219.212 278.571 201.675 270.294C196.972 332.861 228.744 379.287 282.159 393.61C341.892 409.629 369.349 357.401 375.589 345.533L375.59 345.529L375.663 345.386C375.663 348.017 375.467 350.655 375.088 353.29C377.166 348.047 379.065 342.261 380.762 335.879L381.699 336.128C379.537 344.264 377.043 351.446 374.268 357.781C371.642 369.633 365.447 381.348 356.836 392.169C368.082 380.68 376.266 368.827 380.981 358.842C371.404 379.128 356.972 397.806 339.436 413.797C301.093 448.762 247.909 470.877 198.175 468.855C196.487 468.787 194.804 468.69 193.125 468.566L193.131 468.48L188.795 488.54H162.793L154.215 465.497ZM86.3515 154.943L85.2207 161.819C79.2169 195.31 66.0836 221.662 35.5968 279.608C9.02326 330.115 24.5004 386.351 55.3626 414.19C84.6973 440.653 105.686 448.103 121.266 453.633C122.556 454.091 123.81 454.536 125.028 454.977C132.684 457.753 140.196 459.407 145.819 460.365C146.204 460.43 146.58 460.493 146.946 460.552L152.726 461.495L150.425 455.314C132.486 401.709 134.639 328.706 142.932 269.81L104.718 275.542L95.0664 254.132L155.694 205.185C159.816 189.82 163.971 178.433 167.425 172.791C167.425 172.791 142.542 183.987 114.565 174.902C98.7025 169.751 90.4898 161.298 86.3515 154.943ZM194.182 463.582L199.227 463.891C233.254 465.08 269.124 454.645 300.491 436.245C302.803 434.889 305.088 433.491 307.344 432.052C322.418 422.063 332.907 413.136 336.268 409.919C303.956 433.403 257.317 449.061 200.941 431.69L194.182 463.582ZM179.77 101.133C179.77 101.133 175.946 103.617 165.249 101.754C154.551 99.8901 144.494 88.7684 144.494 88.7684L179.77 101.133Z" />
      <path d="M367.666 326.332L388.786 306.089L398.372 333.549L367.666 326.332Z" />
      <path d="M1716.87 336V216H1754.76V240C1760.59 224.4 1775.17 214.8 1797.03 214.8H1804.32V243.6H1791.2C1766.42 243.6 1754.76 253.2 1754.76 273.6V336H1716.87Z" />
      <path d="M1633.52 338.4C1597.08 338.4 1564.14 315.6 1564.14 276C1564.14 240 1589.8 213.6 1633.52 213.6C1677.25 213.6 1699.99 239.76 1699.99 274.56C1699.99 278.16 1699.7 282 1699.41 285.84H1600.87C1602.33 302.4 1618.07 313.2 1633.81 313.2H1636.15C1650.43 313.2 1659.18 306.24 1661.8 298.08H1699.41C1692.41 321.6 1669.96 338.4 1633.52 338.4ZM1600.87 261.84H1663.26C1662.38 247.44 1648.97 238.8 1633.23 238.8H1630.9C1615.16 238.8 1601.75 247.44 1600.87 261.84Z" />
      <path d="M1522.94 336C1498.16 336 1485.04 325.2 1485.04 304.8V241.2H1455.02V216H1485.04V177.12H1522.94V216H1555.59V241.2H1522.94V296.4C1522.94 307.2 1525.85 309.6 1538.97 309.6H1559.96V336H1522.94Z" />
      <path d="M1315.07 336V216H1352.96V233.52C1361.71 221.52 1378.03 213.6 1396.98 213.6C1431.96 213.6 1447.71 232.8 1447.71 259.2V336H1409.81V262.8C1409.81 247.2 1401.35 238.8 1386.78 238.8H1384.45C1366.96 238.8 1352.96 252.48 1352.96 269.28V336H1315.07Z" />
      <path d="M1210.06 338.4C1175.95 338.4 1160.79 319.2 1160.79 292.8V216H1198.69V289.2C1198.69 304.8 1206.56 313.2 1220.26 313.2H1222.59C1239.21 313.2 1252.62 299.52 1252.62 282.72V216H1290.51V336H1252.62V318.48C1243.87 330.48 1228.42 338.4 1210.06 338.4Z" />
      <path d="M967.116 336V168H1006.47V237.6H1095.38V168H1134.74V336H1095.38V266.4H1006.47V336H967.116Z" />
      <path d="M807.545 336L860.309 275.52L809.003 216H851.272L881.59 251.04L912.199 216H953.302L901.996 274.8L954.76 336H912.49L880.715 299.28L848.648 336H807.545Z" />
      <path d="M747.366 338.4C710.926 338.4 677.985 315.6 677.985 276C677.985 240 703.639 213.6 747.366 213.6C791.093 213.6 813.831 239.76 813.831 274.56C813.831 278.16 813.539 282 813.248 285.84H714.716C716.174 302.4 731.915 313.2 747.657 313.2H749.989C764.274 313.2 773.019 306.24 775.643 298.08H813.248C806.252 321.6 783.805 338.4 747.366 338.4ZM714.716 261.84H777.1C776.226 247.44 762.816 238.8 747.074 238.8H744.742C729 238.8 715.591 247.44 714.716 261.84Z" />
      <path d="M495 336V168H564.963C626.181 168 668.451 196.8 668.451 252C668.451 307.2 627.639 336 566.421 336H495ZM534.354 307.2H562.048C601.403 307.2 629.097 294 629.097 252C629.097 210 601.403 196.8 562.048 196.8H534.354V307.2Z" />
    </SvgIcon>
  );
};

export default XerberusLogo;
