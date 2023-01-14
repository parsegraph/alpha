import {
  AlphaColor,
  AlphaFace,
  AlphaShape,
  AlphaSkin,
  alphaQUADS,
} from "./BlockStuff";
import { AlphaVector } from "./Maths";

// CubeMan version 1.0
export default function CubeMan(BlockTypes) {
  const v = [
    new AlphaVector(-0.102166, -0.246654, 0.102166),
    new AlphaVector(-0.102166, -0.246654, -0.102166),
    new AlphaVector(0.102166, -0.246654, -0.102166),
    new AlphaVector(0.102166, -0.246654, 0.102166),
    new AlphaVector(-0.102166, -0.040906, 0.102166),
    new AlphaVector(-0.102166, -0.040906, -0.102166),
    new AlphaVector(0.102166, -0.040906, -0.102166),
    new AlphaVector(0.102166, -0.040906, 0.102166),
    new AlphaVector(-0.07235, -0.281348, -0.07235),
    new AlphaVector(-0.07235, -0.281348, 0.07235),
    new AlphaVector(0.07235, -0.281348, -0.07235),
    new AlphaVector(0.07235, -0.281348, 0.07235),
    new AlphaVector(-0.07235, -0.281348, -0.07235),
    new AlphaVector(-0.07235, -0.281348, 0.07235),
    new AlphaVector(0.07235, -0.281348, -0.07235),
    new AlphaVector(0.07235, -0.281348, 0.07235),
    new AlphaVector(-0.157418, -0.962703, -0.107114),
    new AlphaVector(-0.157418, -0.962703, 0.107114),
    new AlphaVector(0.157418, -0.962703, -0.107114),
    new AlphaVector(0.157418, -0.962703, 0.107114),
    new AlphaVector(-0.250627, -0.385758, -0.107114),
    new AlphaVector(-0.250627, -0.385758, 0.107114),
    new AlphaVector(0.250627, -0.385758, -0.107114),
    new AlphaVector(0.250627, -0.385758, 0.107114),
    new AlphaVector(-0.219117, -0.512434, -0.107114),
    new AlphaVector(0.219117, -0.512434, -0.107114),
    new AlphaVector(0.219117, -0.512434, 0.107114),
    new AlphaVector(-0.219117, -0.512434, 0.107114),
    new AlphaVector(-0.156655, -0.795676, -0.107114),
    new AlphaVector(0.156655, -0.795676, -0.107114),
    new AlphaVector(0.156655, -0.795676, 0.107114),
    new AlphaVector(-0.156655, -0.795676, 0.107114),
    new AlphaVector(0.250627, -0.385758, -0.107114),
    new AlphaVector(0.250627, -0.385758, 0.107114),
    new AlphaVector(0.219117, -0.512434, -0.107114),
    new AlphaVector(0.219117, -0.512434, 0.107114),
    new AlphaVector(0.47824, -0.752908, -0.079144),
    new AlphaVector(0.47824, -0.752908, 0.079144),
    new AlphaVector(0.406667, -0.817066, -0.079144),
    new AlphaVector(0.406667, -0.817066, 0.079144),
    new AlphaVector(0.47824, -0.752908, -0.079144),
    new AlphaVector(0.47824, -0.752908, 0.079144),
    new AlphaVector(0.406667, -0.817066, -0.079144),
    new AlphaVector(0.406667, -0.817066, 0.079144),
    new AlphaVector(0.47824, -0.752908, -0.079144),
    new AlphaVector(0.47824, -0.752908, 0.079144),
    new AlphaVector(0.406667, -0.817066, 0.079144),
    new AlphaVector(0.47824, -1.111776, -0.079144),
    new AlphaVector(0.47824, -1.111776, 0.079144),
    new AlphaVector(0.406667, -1.14858, -0.079144),
    new AlphaVector(0.406667, -1.175934, 0.079144),
    new AlphaVector(0.442454, -1.143855, 0.079144),
    new AlphaVector(-0.157418, -0.962703, -0.107114),
    new AlphaVector(-0.157418, -0.962703, 0.107114),
    new AlphaVector(0.157418, -0.962703, -0.107114),
    new AlphaVector(0.157418, -0.962703, 0.107114),
    new AlphaVector(-0.156655, -0.795676, -0.107114),
    new AlphaVector(-0.156655, -0.795676, 0.107114),
    new AlphaVector(-0.156655, -0.795676, -0.107114),
    new AlphaVector(-0.156655, -0.795676, 0.107114),
    new AlphaVector(-0.156655, -0.795676, -0.107114),
    new AlphaVector(-0.156655, -0.795676, 0.107114),
    new AlphaVector(-0.25854, -1.307287, -0.083569),
    new AlphaVector(-0.25854, -1.307287, 0.083569),
    new AlphaVector(-0.13632, -1.333494, -0.083569),
    new AlphaVector(-0.13632, -1.333494, 0.083569),
    new AlphaVector(-0.292975, -1.917316, -0.107114),
    new AlphaVector(-0.292975, -1.917316, 0.107114),
    new AlphaVector(-0.13632, -1.950906, -0.107114),
    new AlphaVector(-0.13632, -1.950906, 0.107114),
    new AlphaVector(0.102166, -0.040906, 0.102166),
    new AlphaVector(0.102166, -0.040906, -0.102166),
    new AlphaVector(-0.102166, -0.040906, -0.102166),
    new AlphaVector(-0.102166, -0.040906, 0.102166),
    new AlphaVector(0.07235, -0.281348, -0.07235),
    new AlphaVector(0.07235, -0.281348, 0.07235),
    new AlphaVector(-0.07235, -0.281348, -0.07235),
    new AlphaVector(-0.07235, -0.281348, 0.07235),
    new AlphaVector(0.07235, -0.281348, -0.07235),
    new AlphaVector(0.07235, -0.281348, 0.07235),
    new AlphaVector(-0.07235, -0.281348, -0.07235),
    new AlphaVector(-0.07235, -0.281348, 0.07235),
    new AlphaVector(0.157418, -0.962703, -0.107114),
    new AlphaVector(0.157418, -0.962703, 0.107114),
    new AlphaVector(-0.157418, -0.962703, -0.107114),
    new AlphaVector(-0.157418, -0.962703, 0.107114),
    new AlphaVector(0.250627, -0.385758, 0.107114),
    new AlphaVector(-0.250627, -0.385758, -0.107114),
    new AlphaVector(-0.250627, -0.385758, 0.107114),
    new AlphaVector(0.219117, -0.512434, -0.107114),
    new AlphaVector(-0.219117, -0.512434, -0.107114),
    new AlphaVector(-0.219117, -0.512434, 0.107114),
    new AlphaVector(0.219117, -0.512434, 0.107114),
    new AlphaVector(0.156655, -0.795676, -0.107114),
    new AlphaVector(-0.156655, -0.795676, -0.107114),
    new AlphaVector(-0.156655, -0.795676, 0.107114),
    new AlphaVector(0.156655, -0.795676, 0.107114),
    new AlphaVector(-0.250627, -0.385758, -0.107114),
    new AlphaVector(-0.250627, -0.385758, 0.107114),
    new AlphaVector(-0.219117, -0.512434, -0.107114),
    new AlphaVector(-0.219117, -0.512434, 0.107114),
    new AlphaVector(-0.47824, -0.752908, -0.079144),
    new AlphaVector(-0.47824, -0.752908, 0.079144),
    new AlphaVector(-0.406667, -0.817066, -0.079144),
    new AlphaVector(-0.406667, -0.817066, 0.079144),
    new AlphaVector(-0.47824, -0.752908, -0.079144),
    new AlphaVector(-0.47824, -0.752908, 0.079144),
    new AlphaVector(-0.406667, -0.817066, -0.079144),
    new AlphaVector(-0.406667, -0.817066, 0.079144),
    new AlphaVector(-0.47824, -0.752908, -0.079144),
    new AlphaVector(-0.47824, -0.752908, 0.079144),
    new AlphaVector(-0.406667, -0.817066, 0.079144),
    new AlphaVector(-0.47824, -1.111776, -0.079144),
    new AlphaVector(-0.47824, -1.111776, 0.079144),
    new AlphaVector(-0.406667, -1.14858, -0.079144),
    new AlphaVector(-0.406667, -1.175934, 0.079144),
    new AlphaVector(0.157418, -0.962703, 0.107114),
    new AlphaVector(-0.157418, -0.962703, 0.107114),
    new AlphaVector(0.0, -0.829266, -0.107114),
    new AlphaVector(0.0, -0.829266, 0.107114),
    new AlphaVector(0.156655, -0.795676, -0.107114),
    new AlphaVector(0.156655, -0.795676, 0.107114),
    new AlphaVector(0.0, -0.829266, -0.107114),
    new AlphaVector(0.0, -0.829266, 0.107114),
    new AlphaVector(0.156655, -0.795676, -0.107114),
    new AlphaVector(0.156655, -0.795676, 0.107114),
    new AlphaVector(0.0, -0.829266, -0.107114),
    new AlphaVector(0.0, -0.829266, 0.107114),
    new AlphaVector(0.156655, -0.795676, -0.107114),
    new AlphaVector(0.156655, -0.795676, 0.107114),
    new AlphaVector(0.0, -0.829266, -0.107114),
    new AlphaVector(0.0, -0.829266, 0.107114),
    new AlphaVector(0.25854, -1.307287, -0.083569),
    new AlphaVector(0.25854, -1.307287, 0.083569),
    new AlphaVector(0.13632, -1.333494, -0.083569),
    new AlphaVector(0.13632, -1.333494, 0.083569),
    new AlphaVector(0.292975, -1.917316, -0.107114),
    new AlphaVector(0.292975, -1.917316, 0.107114),
    new AlphaVector(0.13632, -1.950906, -0.107114),
    new AlphaVector(0.13632, -1.950906, 0.107114),
    new AlphaVector(0.0, -0.385758, 0.107114),
    new AlphaVector(0.0, -0.385758, -0.107114),
  ];

  const shape = new AlphaShape(
    new AlphaFace(alphaQUADS, v[4], v[5], v[1], v[0]),
    new AlphaFace(alphaQUADS, v[5], v[6], v[2], v[1]),
    new AlphaFace(alphaQUADS, v[6], v[7], v[3], v[2]),
    new AlphaFace(alphaQUADS, v[7], v[4], v[0], v[3]),
    new AlphaFace(alphaQUADS, v[8], v[10], v[14], v[12]),
    new AlphaFace(alphaQUADS, v[8], v[9], v[0], v[1]),
    new AlphaFace(alphaQUADS, v[10], v[8], v[1], v[2]),
    new AlphaFace(alphaQUADS, v[11], v[10], v[2], v[3]),
    new AlphaFace(alphaQUADS, v[9], v[11], v[3], v[0]),
    new AlphaFace(alphaQUADS, v[10], v[11], v[15], v[14]),
    new AlphaFace(alphaQUADS, v[11], v[9], v[13], v[15]),
    new AlphaFace(alphaQUADS, v[9], v[8], v[12], v[13]),
    new AlphaFace(alphaQUADS, v[13], v[12], v[20], v[21]),
    new AlphaFace(alphaQUADS, v[14], v[15], v[23], v[22]),
    new AlphaFace(alphaQUADS, v[25], v[22], v[32], v[34]),
    new AlphaFace(alphaQUADS, v[27], v[24], v[28], v[31]),
    new AlphaFace(alphaQUADS, v[35], v[34], v[38], v[39]),
    new AlphaFace(alphaQUADS, v[22], v[23], v[33], v[32]),
    new AlphaFace(alphaQUADS, v[23], v[26], v[35], v[33]),
    new AlphaFace(alphaQUADS, v[26], v[25], v[34], v[35]),
    new AlphaFace(alphaQUADS, v[39], v[38], v[42], v[43]),
    new AlphaFace(alphaQUADS, v[32], v[33], v[37], v[36]),
    new AlphaFace(alphaQUADS, v[34], v[32], v[36], v[38]),
    new AlphaFace(alphaQUADS, v[33], v[35], v[39], v[37]),
    new AlphaFace(alphaQUADS, v[41], v[43], v[46], v[45]),
    new AlphaFace(alphaQUADS, v[36], v[37], v[41], v[40]),
    new AlphaFace(alphaQUADS, v[38], v[36], v[40], v[42]),
    new AlphaFace(alphaQUADS, v[37], v[39], v[43], v[41]),
    new AlphaFace(alphaQUADS, v[42], v[44], v[47], v[49]),
    new AlphaFace(alphaQUADS, v[40], v[41], v[45], v[44]),
    new AlphaFace(alphaQUADS, v[46], v[50], v[48], v[45]),
    new AlphaFace(alphaQUADS, v[98], v[95], v[131], v[140]),
    new AlphaFace(alphaQUADS, v[118], v[29], v[30], v[119]),
    new AlphaFace(alphaQUADS, v[56], v[122], v[126], v[58]),
    new AlphaFace(alphaQUADS, v[119], v[31], v[57], v[123]),
    new AlphaFace(alphaQUADS, v[31], v[28], v[56], v[57]),
    new AlphaFace(alphaQUADS, v[28], v[118], v[122], v[56]),
    new AlphaFace(alphaQUADS, v[58], v[126], v[130], v[60]),
    new AlphaFace(alphaQUADS, v[123], v[57], v[59], v[127]),
    new AlphaFace(alphaQUADS, v[57], v[56], v[58], v[59]),
    new AlphaFace(alphaQUADS, v[61], v[60], v[62], v[63]),
    new AlphaFace(alphaQUADS, v[127], v[59], v[61], v[131]),
    new AlphaFace(alphaQUADS, v[59], v[58], v[60], v[61]),
    new AlphaFace(alphaQUADS, v[64], v[65], v[69], v[68]),
    new AlphaFace(alphaQUADS, v[60], v[130], v[64], v[62]),
    new AlphaFace(alphaQUADS, v[131], v[61], v[63], v[65]),
    new AlphaFace(alphaQUADS, v[130], v[131], v[65], v[64]),
    new AlphaFace(alphaQUADS, v[66], v[68], v[69], v[67]),
    new AlphaFace(alphaQUADS, v[63], v[62], v[66], v[67]),
    new AlphaFace(alphaQUADS, v[62], v[64], v[68], v[66]),
    new AlphaFace(alphaQUADS, v[65], v[63], v[67], v[69]),
    new AlphaFace(alphaQUADS, v[74], v[78], v[80], v[76]),
    new AlphaFace(alphaQUADS, v[76], v[80], v[81], v[77]),
    new AlphaFace(alphaQUADS, v[77], v[81], v[79], v[75]),
    new AlphaFace(alphaQUADS, v[75], v[79], v[78], v[74]),
    new AlphaFace(alphaQUADS, v[118], v[122], v[123], v[119]),
    new AlphaFace(alphaQUADS, v[90], v[99], v[97], v[87]),
    new AlphaFace(alphaQUADS, v[92], v[96], v[93], v[89]),
    new AlphaFace(alphaQUADS, v[100], v[104], v[103], v[99]),
    new AlphaFace(alphaQUADS, v[87], v[97], v[98], v[88]),
    new AlphaFace(alphaQUADS, v[88], v[98], v[100], v[91]),
    new AlphaFace(alphaQUADS, v[91], v[100], v[99], v[90]),
    new AlphaFace(alphaQUADS, v[104], v[108], v[107], v[103]),
    new AlphaFace(alphaQUADS, v[97], v[101], v[102], v[98]),
    new AlphaFace(alphaQUADS, v[99], v[103], v[101], v[97]),
    new AlphaFace(alphaQUADS, v[98], v[102], v[104], v[100]),
    new AlphaFace(alphaQUADS, v[106], v[110], v[111], v[108]),
    new AlphaFace(alphaQUADS, v[101], v[105], v[106], v[102]),
    new AlphaFace(alphaQUADS, v[103], v[107], v[105], v[101]),
    new AlphaFace(alphaQUADS, v[102], v[106], v[108], v[104]),
    new AlphaFace(alphaQUADS, v[45], v[48], v[47], v[44]),
    new AlphaFace(alphaQUADS, v[105], v[109], v[110], v[106]),
    new AlphaFace(alphaQUADS, v[113], v[110], v[109], v[112]),
    new AlphaFace(alphaQUADS, v[115], v[111], v[110], v[113]),
    new AlphaFace(alphaQUADS, v[49], v[47], v[48], v[50]),
    new AlphaFace(alphaQUADS, v[42], v[49], v[50], v[46]),
    new AlphaFace(alphaQUADS, v[129], v[86], v[140], v[131]),
    new AlphaFace(alphaQUADS, v[70], v[71], v[72], v[73]),
    new AlphaFace(alphaQUADS, v[118], v[119], v[95], v[94]),
    new AlphaFace(alphaQUADS, v[120], v[124], v[126], v[122]),
    new AlphaFace(alphaQUADS, v[119], v[123], v[121], v[96]),
    new AlphaFace(alphaQUADS, v[96], v[121], v[120], v[93]),
    new AlphaFace(alphaQUADS, v[93], v[120], v[122], v[118]),
    new AlphaFace(alphaQUADS, v[124], v[128], v[130], v[126]),
    new AlphaFace(alphaQUADS, v[123], v[127], v[125], v[121]),
    new AlphaFace(alphaQUADS, v[122], v[126], v[127], v[123]),
    new AlphaFace(alphaQUADS, v[121], v[125], v[124], v[120]),
    new AlphaFace(alphaQUADS, v[129], v[133], v[132], v[128]),
    new AlphaFace(alphaQUADS, v[127], v[131], v[129], v[125]),
    new AlphaFace(alphaQUADS, v[126], v[130], v[131], v[127]),
    new AlphaFace(alphaQUADS, v[125], v[129], v[128], v[124]),
    new AlphaFace(alphaQUADS, v[134], v[138], v[139], v[135]),
    new AlphaFace(alphaQUADS, v[128], v[132], v[134], v[130]),
    new AlphaFace(alphaQUADS, v[131], v[135], v[133], v[129]),
    new AlphaFace(alphaQUADS, v[130], v[134], v[135], v[131]),
    new AlphaFace(alphaQUADS, v[136], v[137], v[139], v[138]),
    new AlphaFace(alphaQUADS, v[133], v[137], v[136], v[132]),
    new AlphaFace(alphaQUADS, v[132], v[136], v[138], v[134]),
    new AlphaFace(alphaQUADS, v[135], v[139], v[137], v[133]),
    new AlphaFace(alphaQUADS, v[109], v[107], v[114], v[112]),
    new AlphaFace(alphaQUADS, v[112], v[114], v[115], v[113]),
    new AlphaFace(alphaQUADS, v[107], v[111], v[115], v[114]),
    new AlphaFace(alphaQUADS, v[97], v[80], v[78], v[32]),
    new AlphaFace(alphaQUADS, v[141], v[130], v[94], v[97]),
    new AlphaFace(alphaQUADS, v[128], v[32], v[141], v[130]),
    new AlphaFace(alphaQUADS, v[86], v[79], v[81], v[98])
  );

  // const white = new AlphaColor(1, 1, 1);
  const gray = new AlphaColor(0.5, 0.5, 0.5);
  // const dgray = new AlphaColor(0.25, 0.25, 0.25);
  const owhite = new AlphaColor(0.9, 0.9, 0.9);
  // const black = new AlphaColor(0, 0, 0);
  let blank = [];
  for (let i = 0; i < 150; ++i) {
    blank[i] = [gray, owhite, owhite, gray];
  }
  blank = new AlphaSkin(blank);

  BlockTypes.load("blank", "cubeman", blank, shape);
}
