// tile class, essentially just a square
class tile
{
    x;
    y;
    width;
    height;
    tag; // tag defines the type of tile that the object is

    constructor(x: number, y: number, w: number, h: number, t: string)
    {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.tag = t;
    }
}

// manages all world/chunk generation
export default class World
{
    // number determines biome (1 -3)
    biome: number = 1;

    // generates the world (seed must be 3 digits)
    CreateWorld(seed: number)
    {
        // tiles array
        var tiles = new Array();

        // gets amount of chunks by reducing the 3 digit seed to a decimal, then multiplying by 100 and rounding off any leftover decimal numbers
        var chunkAmount = Math.round((seed/999)*100);

        // generate starter chunk
        tiles.push.apply(tiles, this.CreateChunk(chunkAmount, 'start'));

        // run this loop based on the amount of chunks created, which is seed/999 = decimal so we multiply by 100 and round to even number
        for(var i = 1; i < chunkAmount; i++)
        {
            // list of options of chunks, repetition is to increase likelihood amongst other chunks
            let options = [
                'empty', 'empty',
                'semi-empty', 'semi-empty', 'semi-empty',
                'blocked', 'blocked',
                'trap',
            ];

            // add a random chunk chosen from the "options" list
            tiles.push.apply(tiles, this.CreateChunk(chunkAmount-i, options[Math.round(Math.random()*options.length)]));
        }

        // return array of tiles
        return tiles;
    }

    /*
        chunk size: 320x640 pixels = 10x20 tiles

        take away one block from each side for borders = 8x20 tiles

        x defaults to 0 because its a game scrolling up and down only

        y: in multiples of 640

        type: empty, semi-empty, blocked, trap1, trap2
    */
    CreateChunk(y: number, type: string)
    {
        // tiles
        var tiles = new Array();

        switch(type)
        {
            case 'empty': // empty chunk
                // first iterate through x position (index of row)
                for(let xpos = 0; xpos < 10; xpos++)
                {
                    // now iterate through y position (index of column)
                    for(let ypos = 0; ypos < 20; ypos++)
                    {
                        if(xpos == 0)
                        {
                            tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'border-left'));
                        }
                        else if(xpos == 9)
                        {
                            tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'border-right'));
                        }
                        else
                        {
                            tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'floor'));
                        }
                    }
                }
                break;

            case 'semi-empty': // mix of blocks here and there
                // first iterate through x position (index of row)
                for(let xpos = 0; xpos < 10; xpos++)
                {
                    // now iterate through y position (index of column)
                    for(let ypos = 0; ypos < 20; ypos++)
                    {
                        if(xpos == 0)
                        {
                            tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'border-left'));
                        }
                        else if(xpos == 9)
                        {
                            tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'border-right'));
                        }
                        else
                        {
                            // 1/4 chances that a block would be placed
                            let tileType = Math.random(); // in between of 0 and 1

                            if(tileType <= 0.25)
                            {
                                tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'floor')); // regular floor

                                tiles.push(this.CreateWall(xpos*32, ypos*32+y*640)); // place block on top
                            }
                            else
                            {
                                tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'floor')); // regular floor
                            }
                        }
                    }
                }
                break;

            case 'blocked': // blocked passageway
                // first iterate through x position (index of row)
                for(let xpos = 0; xpos < 10; xpos++)
                {
                    // now iterate through y position (index of column)
                    for(let ypos = 0; ypos < 20; ypos++)
                    {
                        if(xpos == 0)
                        {
                            tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'border-left'));
                        }
                        else if(xpos == 9)
                        {
                            tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'border-right'));
                        }
                        else
                        {
                            // check if on bottom or top of chunk, 2 chunks max distance, both top and bottom
                            if(ypos <= 1 || ypos >= 18)
                            {
                                // if near the ends of the chunk, then make it more likely to spawn an empty space, so it looks smoother to transition
                                // between chunks, rather than it just looking forcibly cut off, it just looks more natural, yk

                                // 3/4 chances that an empty space would occur
                                let tileType = Math.random(); // in between of 0 and 1

                                if(tileType <= 0.75)
                                {
                                    tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'floor')); // regular floor
                                }
                                else
                                {
                                    tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'floor')); // regular floor

                                    tiles.push(this.CreateWall(xpos*32, ypos*32+y*640)); // place block on top
                                }
                            }
                            else
                            {
                                // 1/10 chances that an empty space would occur
                                let tileType = Math.random(); // in between of 0 and 1

                                if(tileType <= 0.1)
                                {
                                    tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'floor')); // regular floor
                                }
                                else
                                {
                                    tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'floor')); // regular floor

                                    tiles.push(this.CreateWall(xpos*32, ypos*32+y*640)); // place block on top
                                }
                            }
                        }
                    }
                }
                break;
            
            case 'start': // start is an empty chunk with an unbreakable border at the bottom
                // first iterate through x position (index of row)
                for(let xpos = 0; xpos < 10; xpos++)
                {
                    // now iterate through y position (index of column)
                    for(let ypos = 0; ypos < 20; ypos++)
                    {
                        if(xpos == 0 && ypos == 19)
                        {
                            tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'border-bottom-left'));
                        }
                        else if(xpos == 9 && ypos == 19)
                        {
                            tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'border-bottom-right'));
                        }
                        else if(ypos == 19)
                        {
                            tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'border-bottom'));
                        }
                        else if(xpos == 0)
                        {
                            tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'border-left'));
                        }
                        else if(xpos == 9)
                        {
                            tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'border-right'));
                        }
                        else
                        {
                            tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'floor'));
                        }
                    }
                }
                break;

            case 'trap':
                // switch case for biome
                switch(this.biome)
                {
                    case 1: // biome 1

                        // mud

                        tiles = this.CreateMud(y);

                        break;
                    
                    case 2: // biome 2

                        // mud OR proximity mine

                        // 0 - 1
                        var trapType = Math.random();

                        // 1/3 chance to spawn a biome 1 type trap (mud)
                        if(trapType <= 0.33)
                        {
                            tiles = this.CreateMud(y);
                        }
                        // 2/3 chance to spawn a proximity mine trap
                        else if(trapType > 0.33)
                        {
                            tiles = this.CreateProxyMine(y);
                        }

                        break;

                    case 3: // biome 3

                        // mud OR proximity mine OR poison clouds

                        // 0 - 1
                        var trapType = Math.random();

                        // 1/4 chance to spawn mud
                        if(trapType <= 0.525)
                        {
                            tiles = this.CreateMud(y);
                        }
                        // 1/4 chance to spawn proximity mines
                        else if(trapType > 0.525 && trapType <= 0.5)
                        {
                            tiles = this.CreateProxyMine(y);
                        }
                        // 2/4 chance to spawn poison clouds
                        else if(trapType > 0.5)
                        {
                            tiles = this.CreatePoisonCloud(y);
                        }

                        break;
                }
                break;
        }

        // return array of tiles
        return tiles;
    }

    // special chunks

    // traps are semi-empty chunks that have one or two of the given trap spawn on a free spot

    // mud trap chunk
    CreateMud(y: number)
    {
        // create tiles array
        var tiles = new Array();

        // first iterate through x position (index of row)
        for(let xpos = 0; xpos < 10; xpos++)
        {
            // now iterate through y position (index of column)
            for(let ypos = 0; ypos < 20; ypos++)
            {
                if(xpos == 0)
                {
                    tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'border-left'));
                }
                else if(xpos == 9)
                {
                    tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'border-right'));
                }
                else
                {
                    // 1/4 chances that a block would be placed
                    let tileType = Math.random(); // in between of 0 and 1

                    if(tileType <= 0.05) // if the type goes into the 5% percentile, place a mud block
                    {
                        tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'floor')); // regular floor

                        tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'mud')); // mud
                    }
                    else if(tileType <= 0.25)
                    {
                        tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'floor')); // regular floor

                        tiles.push(this.CreateWall(xpos*32, ypos*32+y*640)); // place block on top
                    }
                    else
                    {
                        tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'floor')); // regular floor
                    }
                }
            }
        }

        // return chunk
        return tiles;
    }

    // proximity mine trap chunk
    CreateProxyMine(y: number)
    {
        // create tiles array
        var tiles = new Array();

        // first iterate through x position (index of row)
        for(let xpos = 0; xpos < 10; xpos++)
        {
            // now iterate through y position (index of column)
            for(let ypos = 0; ypos < 20; ypos++)
            {
                if(xpos == 0)
                {
                    tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'border-left'));
                }
                else if(xpos == 9)
                {
                    tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'border-right'));
                }
                else
                {
                    // 1/4 chances that a block would be placed
                    let tileType = Math.random(); // in between of 0 and 1

                    if(tileType <= 0.05) // if the percentage is under 1%, place a proximity mine, there won't be much of them
                    {
                        tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'floor')); // regular floor

                        tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'proxy-mine')); // proximity mine
                    }
                    else if(tileType <= 0.25)
                    {
                        tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'floor')); // regular floor

                        tiles.push(this.CreateWall(xpos*32, ypos*32+y*640)); // place block on top
                    }
                    else
                    {
                        tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'floor')); // regular floor
                    }
                }
            }
        }

        // return chunk
        return tiles;
    }

    // poison cloud chunk
    CreatePoisonCloud(y: number)
    {
        // create tiles array
        var tiles = new Array();

        // first iterate through x position (index of row)
        for(let xpos = 0; xpos < 10; xpos++)
        {
            // now iterate through y position (index of column)
            for(let ypos = 0; ypos < 20; ypos++)
            {
                if(xpos == 0)
                {
                    tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'border-left'));
                }
                else if(xpos == 9)
                {
                    tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'border-right'));
                }
                else
                {
                    // 1/4 chances that a block would be placed
                    let tileType = Math.random(); // in between of 0 and 1

                    if(tileType <= 0.02) // if the type goes into the 2nd percentile, place a poison cloud trap
                    {
                        tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'floor')); // regular floor

                        tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'poison-cloud')); // poison cloud
                    }
                    else if(tileType <= 0.25)
                    {
                        tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'floor')); // regular floor

                        tiles.push(this.CreateWall(xpos*32, ypos*32+y*640)); // place block on top
                    }
                    else
                    {
                        tiles.push(new tile(xpos*32, ypos*32+y*640, 32, 32, 'floor')); // regular floor
                    }
                }
            }
        }

        // return chunk
        return tiles;
    }

    // function to generate block, will choose a random ore type
    CreateWall(x: number, y: number)
    {
        // create base tile
        let t = new tile(x, y, 32, 32, '');

        /*
            10% gold

            15% silver

            25% copper

            50% regular block
        */
        let type = Math.random()*100;

        // set percentage probabilities for all blocks (MUST TOTAL TO 100)
        let goldPercent = 10;
        let silverPercent = 15;
        let copperPercent = 25;
        let normalPercent = 50;

        // 4 different variations for every type of block
        let variation = Math.random(); // 0 - 1

        // make block based on type probability
        if(type <= goldPercent) // gold
        {
            if(variation <= 0.25)
            {
                t.tag = 'gold1';
            }
            else if(variation >= 0.25 && variation < 0.5)
            {
                t.tag = 'gold2';
            }
            else if(variation >= 0.5 && variation < 0.75)
            {
                t.tag = 'gold3';
            }
            else if(variation >= 0.75)
            {
                t.tag = 'gold4';
            }
        }
        else if(type >= goldPercent && type <= silverPercent+goldPercent)
        {
            if(variation <= 0.25)
            {
                t.tag = 'silver1';
            }
            else if(variation >= 0.25 && variation < 0.5)
            {
                t.tag = 'silver2';
            }
            else if(variation >= 0.5 && variation < 0.75)
            {
                t.tag = 'silver3';
            }
            else if(variation >= 0.75)
            {
                t.tag = 'silver4';
            }
        }
        else if(type >= silverPercent+goldPercent && type <= copperPercent+silverPercent+goldPercent)
        {
            if(variation <= 0.25)
            {
                t.tag = 'copper1';
            }
            else if(variation >= 0.25 && variation < 0.5)
            {
                t.tag = 'copper2';
            }
            else if(variation >= 0.5 && variation < 0.75)
            {
                t.tag = 'copper3';
            }
            else if(variation >= 0.75)
            {
                t.tag = 'copper4';
            }
        }
        else if(type >= normalPercent)
        {
            if(variation <= 0.25)
            {
                t.tag = 'normal1';
            }
            else if(variation >= 0.25 && variation < 0.5)
            {
                t.tag = 'normal2';
            }
            else if(variation >= 0.5 && variation < 0.75)
            {
                t.tag = 'normal3';
            }
            else if(variation >= 0.75 && variation < 0.9)
            {
                t.tag = 'normal4';
            }
            else if(variation >= 0.9) // normal blocks have a 5th variation, 10% chance of spawning
            {
                t.tag = 'normal5'; 
            }
        }

        // return generated wall tile
        return t;
    }
}